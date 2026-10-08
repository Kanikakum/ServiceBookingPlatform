const prisma = require('../db/prisma');
const bookingRepository = require('../repositories/booking.repository');
const serviceRepository = require('../repositories/service.repository');
const AppError = require('../utils/appError');

class BookingService {
  /**
   * Helper to format Booking response object with clean numeric prices and ISO dates.
   */
  _formatBooking(booking) {
    if (!booking) return null;
    return {
      id: booking.id,
      customerId: booking.customerId,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      bookingDate: booking.bookingDate ? booking.bookingDate.toISOString().split('T')[0] : null,
      startTime: booking.startTime ? booking.startTime.toISOString() : null,
      endTime: booking.endTime ? booking.endTime.toISOString() : null,
      totalPrice: parseFloat(booking.totalPrice),
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      ...(booking.service && { service: booking.service }),
      ...(booking.provider && { provider: booking.provider }),
      ...(booking.customer && { customer: booking.customer }),
    };
  }

  /**
   * Helper to parse date and time into canonical UTC Date.
   */
  _parseDateTime(dateStr, timeStr) {
    if (timeStr.includes('T')) {
      return new Date(timeStr);
    }
    return new Date(`${dateStr}T${timeStr}:00.000Z`);
  }

  /**
   * Helper to normalize booking date (YYYY-MM-DD) to UTC midnight.
   */
  _normalizeDate(dateStr) {
    return new Date(`${dateStr}T00:00:00.000Z`);
  }

  /**
   * Format HH:mm from Date object in UTC.
   */
  _formatTimeHHMM(date) {
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Calculate advisory slot availability for a service on a given date.
   * Working hours assumption: 09:00 - 18:00 UTC.
   * @param {Object} query - { serviceId, bookingDate }
   * @returns {Promise<Object>}
   */
  async getAvailability({ serviceId, bookingDate }) {
    const service = await serviceRepository.findServiceById(serviceId);
    if (!service || !service.isActive) {
      throw new AppError('Service not found or is currently inactive', 404);
    }

    const bookingDateObj = this._normalizeDate(bookingDate);
    const durationMinutes = service.durationMinutes;

    // Standard working hours window: 09:00 to 18:00 UTC
    const workStartHour = 9;
    const workEndHour = 18;
    const dayStart = new Date(`${bookingDate}T09:00:00.000Z`);
    const dayEnd = new Date(`${bookingDate}T18:00:00.000Z`);

    // Fetch existing active bookings for this provider on the requested date
    const activeBookings = await bookingRepository.findActiveBookingsForProviderDate(
      service.providerId,
      bookingDateObj
    );

    // Generate slot intervals
    const slots = [];
    let currentSlotStart = new Date(dayStart);
    const now = new Date();

    while (currentSlotStart.getTime() + durationMinutes * 60 * 1000 <= dayEnd.getTime()) {
      const currentSlotEnd = new Date(
        currentSlotStart.getTime() + durationMinutes * 60 * 1000
      );

      // Check if slot has already passed
      const isPast = currentSlotStart.getTime() <= now.getTime();

      // Check overlap against active bookings: existing.start < slotEnd AND existing.end > slotStart
      const isOverlapping = activeBookings.some((b) => {
        return b.startTime.getTime() < currentSlotEnd.getTime() && b.endTime.getTime() > currentSlotStart.getTime();
      });

      const isAvailable = !isPast && !isOverlapping;

      slots.push({
        startTime: this._formatTimeHHMM(currentSlotStart),
        endTime: this._formatTimeHHMM(currentSlotEnd),
        available: isAvailable,
      });

      // Increment by duration
      currentSlotStart = new Date(currentSlotStart.getTime() + durationMinutes * 60 * 1000);
    }

    return {
      serviceId: service.id,
      providerId: service.providerId,
      bookingDate,
      durationMinutes,
      workingHours: `${String(workStartHour).padStart(2, '0')}:00 - ${String(workEndHour).padStart(2, '0')}:00`,
      slots,
    };
  }

  /**
   * Create a new booking with ACID transaction and stable provider row locking.
   * Prevents double-booking even under simultaneous concurrent requests.
   * @param {number} customerId
   * @param {Object} payload - { serviceId, bookingDate, startTime, endTime? }
   * @returns {Promise<Object>}
   */
  async createBooking(customerId, payload) {
    const bookingDateObj = this._normalizeDate(payload.bookingDate);
    const startDateTime = this._parseDateTime(payload.bookingDate, payload.startTime);

    // 1. Past date & time validation
    if (startDateTime.getTime() <= Date.now()) {
      throw new AppError('Cannot book an appointment slot in the past.', 400);
    }

    // 2. Execute within an ACID transaction with ReadCommitted isolation and pessimistic row-locking
    const createdBooking = await prisma.$transaction(
      async (tx) => {
        // Step A: Load service inside transaction to verify status and price
        const service = await tx.service.findUnique({
          where: { id: payload.serviceId },
          include: {
            category: true,
          },
        });

        if (!service || !service.isActive) {
          throw new AppError('Service not found or is currently inactive', 404);
        }

        const providerId = service.providerId;
        const durationMinutes = service.durationMinutes;
        const price = service.price;

        // Step B: Calculate and validate end time
        const endDateTime = new Date(
          startDateTime.getTime() + durationMinutes * 60 * 1000
        );

        if (payload.endTime) {
          const clientEndDateTime = this._parseDateTime(payload.bookingDate, payload.endTime);
          if (clientEndDateTime.getTime() !== endDateTime.getTime()) {
            throw new AppError(
              `Provided end time does not match service duration of ${durationMinutes} minutes.`,
              400
            );
          }
        }

        if (startDateTime.getTime() >= endDateTime.getTime()) {
          throw new AppError('Start time must be before end time.', 400);
        }

        // Step C: Acquire an exclusive pessimistic row lock on the provider's stable User row
        // Under ReadCommitted isolation, acquiring this lock serializes all booking creation
        // attempts for this provider, and subsequent reads observe the latest committed state.
        await tx.$queryRaw`
          SELECT id FROM users WHERE id = ${providerId} FOR UPDATE
        `;

        // Step D: Query active conflicting bookings (PENDING or CONFIRMED)
        const conflictingBookings = await tx.booking.findMany({
          where: {
            providerId,
            bookingDate: bookingDateObj,
            status: { in: ['PENDING', 'CONFIRMED'] },
            startTime: { lt: endDateTime },
            endTime: { gt: startDateTime },
          },
        });

        if (conflictingBookings.length > 0) {
          throw new AppError(
            'The selected time slot is no longer available.',
            409,
            {
              code: 'SLOT_CONFLICT',
              providerId,
              requestedSlot: {
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
              },
            }
          );
        }

        // Step E: Insert the new booking with status PENDING and price snapshot
        const booking = await tx.booking.create({
          data: {
            customerId,
            providerId,
            serviceId: service.id,
            bookingDate: bookingDateObj,
            startTime: startDateTime,
            endTime: endDateTime,
            totalPrice: price, // Snapshots service price at booking time
            status: 'PENDING',
          },
          include: {
            service: {
              select: {
                id: true,
                title: true,
                durationMinutes: true,
              },
            },
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return booking;
      },
      {
        isolationLevel: 'ReadCommitted',
        timeout: 15000,
      }
    );

    return this._formatBooking(createdBooking);
  }

  /**
   * Provider accepts a pending booking (PENDING -> CONFIRMED).
   * @param {number} bookingId
   * @param {number} providerId
   * @returns {Promise<Object>}
   */
  async acceptBooking(bookingId, providerId) {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.providerId !== providerId) {
      throw new AppError('Access forbidden: you do not own this booking', 403);
    }

    if (booking.status !== 'PENDING') {
      throw new AppError(
        `Cannot accept booking with status '${booking.status}'. Only PENDING bookings can be accepted.`,
        409
      );
    }

    const updated = await bookingRepository.updateBookingStatus(bookingId, 'CONFIRMED');
    return this._formatBooking(updated);
  }

  /**
   * Provider rejects a pending booking (PENDING -> REJECTED).
   * @param {number} bookingId
   * @param {number} providerId
   * @returns {Promise<Object>}
   */
  async rejectBooking(bookingId, providerId) {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.providerId !== providerId) {
      throw new AppError('Access forbidden: you do not own this booking', 403);
    }

    if (booking.status !== 'PENDING') {
      throw new AppError(
        `Cannot reject booking with status '${booking.status}'. Only PENDING bookings can be rejected.`,
        409
      );
    }

    const updated = await bookingRepository.updateBookingStatus(bookingId, 'REJECTED');
    return this._formatBooking(updated);
  }

  /**
   * Customer cancels an active booking (PENDING/CONFIRMED -> CANCELLED).
   * @param {number} bookingId
   * @param {number} customerId
   * @returns {Promise<Object>}
   */
  async cancelBooking(bookingId, customerId) {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.customerId !== customerId) {
      throw new AppError('Access forbidden: you do not own this booking', 403);
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new AppError(
        `Cannot cancel booking with status '${booking.status}'. Only PENDING or CONFIRMED bookings can be cancelled.`,
        409
      );
    }

    const updated = await bookingRepository.updateBookingStatus(bookingId, 'CANCELLED');
    return this._formatBooking(updated);
  }

  /**
   * Retrieve bookings for authenticated customer with pagination and filters.
   * @param {number} customerId
   * @param {Object} query
   * @returns {Promise<{ items: Array<Object>, pagination: Object }>}
   */
  async getCustomerBookings(customerId, query = {}) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const take = limit;

    const where = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.bookingDate) {
      where.bookingDate = this._normalizeDate(query.bookingDate);
    }

    const [items, totalItems] = await Promise.all([
      bookingRepository.findBookingsByCustomer(customerId, { where, skip, take }),
      bookingRepository.countBookingsByCustomer(customerId, where),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items: items.map((b) => this._formatBooking(b)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * Retrieve bookings for authenticated provider with pagination and filters.
   * @param {number} providerId
   * @param {Object} query
   * @returns {Promise<{ items: Array<Object>, pagination: Object }>}
   */
  async getProviderBookings(providerId, query = {}) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const take = limit;

    const where = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.bookingDate) {
      where.bookingDate = this._normalizeDate(query.bookingDate);
    }

    const [items, totalItems] = await Promise.all([
      bookingRepository.findBookingsByProvider(providerId, { where, skip, take }),
      bookingRepository.countBookingsByProvider(providerId, where),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items: items.map((b) => this._formatBooking(b)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }
}

module.exports = new BookingService();
