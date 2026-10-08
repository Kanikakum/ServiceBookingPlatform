import { apiClient } from './apiClient';

/**
 * Service and Category API integration module.
 */
export const serviceApi = {
  /**
   * Fetch public services catalog with optional search, filters, sorting, and pagination.
   * @param {Object} params - { search, categoryId, minPrice, maxPrice, sort, page, limit }
   * @returns {Promise<{ items: Array<Object>, pagination: Object }>}
   */
  async getServices(params = {}) {
    const query = new URLSearchParams();

    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }
    if (params.categoryId) {
      query.append('categoryId', params.categoryId.toString());
    }
    if (params.minPrice !== undefined && params.minPrice !== '' && !isNaN(params.minPrice)) {
      query.append('minPrice', params.minPrice.toString());
    }
    if (params.maxPrice !== undefined && params.maxPrice !== '' && !isNaN(params.maxPrice)) {
      query.append('maxPrice', params.maxPrice.toString());
    }
    if (params.sort) {
      query.append('sort', params.sort);
    }
    if (params.page) {
      query.append('page', params.page.toString());
    }
    if (params.limit) {
      query.append('limit', params.limit.toString());
    }

    const queryString = query.toString();
    const endpoint = queryString ? `/services?${queryString}` : '/services';
    const response = await apiClient.get(endpoint);
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
   * Fetch all available service categories.
   * @returns {Promise<Array<Object>>}
   */
  async getCategories() {
    const response = await apiClient.get('/categories');
    return response.data.categories;
  },
};
