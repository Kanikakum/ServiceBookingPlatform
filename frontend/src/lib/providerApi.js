import { apiClient } from './apiClient';

/**
 * Provider API integration module for service CRUD and booking management.
 */
export const providerApi = {
  /**
   * Fetch services owned by the authenticated provider.
   * @param {Object} params - { page, limit }
   * @returns {Promise<{ items: Array<Object>, pagination: Object }>}
   */
  async getProviderServices(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const endpoint = queryString ? `/services/provider/me?${queryString}` : '/services/provider/me';
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Create a new service under the authenticated provider.
   * @param {Object} payload - { categoryId, title, description, price, durationMinutes }
   * @returns {Promise<Object>}
   */
  async createService(payload) {
    const response = await apiClient.post('/services', payload);
    return response.data;
  },

  /**
   * Fetch single service details by ID.
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  async getServiceById(id) {
    const response = await apiClient.get(`/services/${id}`);
    return response.data.service;
  },

  /**
   * Update an existing service owned by the authenticated provider.
   * @param {number|string} id
   * @param {Object} payload - { categoryId?, title?, description?, price?, durationMinutes? }
   * @returns {Promise<Object>}
   */
  async updateService(id, payload) {
    const response = await apiClient.put(`/services/${id}`, payload);
    return response.data.service;
  },

  /**
   * Soft-delete/deactivate a service owned by the authenticated provider.
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async deactivateService(id) {
    await apiClient.delete(`/services/${id}`);
  },

  /**
   * Fetch all booking requests scheduled for the authenticated provider.
   * @param {Object} params - { status, bookingDate, page, limit }
   * @returns {Promise<{ items: Array<Object>, pagination: Object }>}
   */
  async getProviderBookings(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.bookingDate) query.append('bookingDate', params.bookingDate);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const endpoint = queryString ? `/bookings/provider?${queryString}` : '/bookings/provider';
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  /**
   * Accept a pending booking request (PENDING -> CONFIRMED).
   * @param {number|string} bookingId
   * @returns {Promise<Object>}
   */
  async acceptBooking(bookingId) {
    const response = await apiClient.patch(`/bookings/${bookingId}/accept`);
    return response.data.booking;
  },

  /**
   * Reject a pending booking request (PENDING -> REJECTED).
   * @param {number|string} bookingId
   * @returns {Promise<Object>}
   */
  async rejectBooking(bookingId) {
    const response = await apiClient.patch(`/bookings/${bookingId}/reject`);
    return response.data.booking;
  },

  /**
   * Fetch category catalog.
   * @returns {Promise<Array<Object>>}
   */
  async getCategories() {
    const response = await apiClient.get('/categories');
    return response.data.categories;
  },
};
