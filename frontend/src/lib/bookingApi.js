import { apiClient } from './apiClient';

/**
 * Booking API integration module.
 */
export const bookingApi = {
  /**
   * Fetch advisory time slot availability for a given service and date.
   * @param {Object} params - { serviceId, bookingDate }
   * @returns {Promise<Object>} - { serviceId, providerId, bookingDate, durationMinutes, slots: [...] }
   */
  async getAvailability({ serviceId, bookingDate }) {
    const query = new URLSearchParams({
      serviceId: serviceId.toString(),
      bookingDate,
    });
    const response = await apiClient.get(`/bookings/availability?${query.toString()}`);
    return response.data;
  },

  /**
   * Create a new booking (ACID transaction protected against double-booking).
   * @param {Object} payload - { serviceId, bookingDate, startTime, endTime? }
   * @returns {Promise<Object>} - Created booking data
   */
  async createBooking(payload) {
    const response = await apiClient.post('/bookings', payload);
    return response.data;
  },

  /**
   * Fetch customer's own bookings list with pagination and optional filters.
   * @param {Object} params - { status, bookingDate, page, limit }
   * @returns {Promise<{ items: Array<Object>, pagination: Object }>}
   */
  async getCustomerBookings(params = {}) {
    const query = new URLSearchParams();

    if (params.status) query.append('status', params.status);
    if (params.bookingDate) query.append('bookingDate', params.bookingDate);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const endpoint = queryString ? `/bookings/customer?${queryString}` : '/bookings/customer';
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Cancel an active booking owned by the authenticated customer.
   * @param {number|string} bookingId
   * @returns {Promise<Object>} - Updated booking object
   */
  async cancelBooking(bookingId) {
    const response = await apiClient.patch(`/bookings/${bookingId}/cancel`);
    return response.data.booking;
  },
};
