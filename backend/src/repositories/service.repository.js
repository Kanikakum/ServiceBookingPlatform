const prisma = require('../db/prisma');

class ServiceRepository {
  /**
   * Create a new service record.
   * @param {Object} data - { providerId, categoryId, title, description, price, durationMinutes }
   * @returns {Promise<import('@prisma/client').Service>}
   */
  async createService(data) {
    return prisma.service.create({
      data: {
        providerId: data.providerId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        price: data.price,
        durationMinutes: data.durationMinutes,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Find a service by primary key ID with safe provider and category information.
   * @param {number} id
   * @returns {Promise<import('@prisma/client').Service | null>}
   */
  async findServiceById(id) {
    return prisma.service.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
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
   * Find services belonging to a specific provider with pagination.
   * @param {number} providerId
   * @param {Object} options - { skip: number, take: number }
   * @returns {Promise<Array<import('@prisma/client').Service>>}
   */
  async findServicesByProvider(providerId, { skip = 0, take = 10 } = {}) {
    return prisma.service.findMany({
      where: { providerId: parseInt(providerId, 10) },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Count total services created by a provider.
   * @param {number} providerId
   * @returns {Promise<number>}
   */
  async countServicesByProvider(providerId) {
    return prisma.service.count({
      where: { providerId: parseInt(providerId, 10) },
    });
  }

  /**
   * Query public catalog services matching active status, search filters, and sorting.
   * @param {Object} params - { where, orderBy, skip, take }
   * @returns {Promise<Array<import('@prisma/client').Service>>}
   */
  async findPublicServices({ where, orderBy, skip = 0, take = 10 }) {
    return prisma.service.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
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
   * Count total public services matching search filters.
   * @param {Object} params - { where }
   * @returns {Promise<number>}
   */
  async countPublicServices({ where }) {
    return prisma.service.count({
      where,
    });
  }

  /**
   * Update service record.
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<import('@prisma/client').Service>}
   */
  async updateService(id, data) {
    return prisma.service.update({
      where: { id: parseInt(id, 10) },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
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
   * Soft-delete/deactivate a service.
   * @param {number} id
   * @returns {Promise<import('@prisma/client').Service>}
   */
  async deactivateService(id) {
    return prisma.service.update({
      where: { id: parseInt(id, 10) },
      data: { isActive: false },
    });
  }
}

module.exports = new ServiceRepository();
