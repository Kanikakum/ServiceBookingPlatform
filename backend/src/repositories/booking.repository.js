const prisma = require('../db/prisma');

class BookingRepository {
  /**
   * Find a booking by its primary key ID.
   * @param {number} id
   * @param {Object} [client=prisma]
   * @returns {Promise<import('@prisma/client').Booking | null>}
   */
  async findBookingById(id, client = prisma) {
    return client.booking.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            durationMinutes: true,
            price: true,
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
  }

  /**
   * Query bookings for a specific customer with pagination and filters.
   * @param {number} customerId
   * @param {Object} options - { where, skip, take }
   * @returns {Promise<Array<import('@prisma/client').Booking>>}
   */
  async findBookingsByCustomer(customerId, { where = {}, skip = 0, take = 10 } = {}) {
    return prisma.booking.findMany({
      where: {
        customerId: parseInt(customerId, 10),
        ...where,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
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
          },
        },
      },
    });
  }

  /**
   * Count total bookings for a specific customer.
   * @param {number} customerId
   * @param {Object} [where={}]
   * @returns {Promise<number>}
   */
  async countBookingsByCustomer(customerId, where = {}) {
    return prisma.booking.count({
      where: {
        customerId: parseInt(customerId, 10),
        ...where,
      },
    });
  }

  /**
   * Query bookings for a specific provider with pagination and filters.
   * @param {number} providerId
   * @param {Object} options - { where, skip, take }
   * @returns {Promise<Array<import('@prisma/client').Booking>>}
   */
  async findBookingsByProvider(providerId, { where = {}, skip = 0, take = 10 } = {}) {
    return prisma.booking.findMany({
      where: {
        providerId: parseInt(providerId, 10),
        ...where,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            durationMinutes: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Count total bookings for a specific provider.
   * @param {number} providerId
   * @param {Object} [where={}]
   * @returns {Promise<number>}
   */
  async countBookingsByProvider(providerId, where = {}) {
    return prisma.booking.count({
      where: {
        providerId: parseInt(providerId, 10),
        ...where,
      },
    });
  }

  /**
   * Find all active (PENDING or CONFIRMED) bookings for a provider on a specific date.
   * @param {number} providerId
   * @param {Date} bookingDate
   * @param {Object} [client=prisma]
   * @returns {Promise<Array<import('@prisma/client').Booking>>}
   */
  async findActiveBookingsForProviderDate(providerId, bookingDate, client = prisma) {
    return client.booking.findMany({
      where: {
        providerId: parseInt(providerId, 10),
        bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Update booking status.
   * @param {number} id
   * @param {string} status
   * @param {Object} [client=prisma]
   * @returns {Promise<import('@prisma/client').Booking>}
   */
  async updateBookingStatus(id, status, client = prisma) {
    return client.booking.update({
      where: { id: parseInt(id, 10) },
      data: { status },
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
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}

module.exports = new BookingRepository();
