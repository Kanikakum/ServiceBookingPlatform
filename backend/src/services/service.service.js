const serviceRepository = require('../repositories/service.repository');
const categoryRepository = require('../repositories/category.repository');
const AppError = require('../utils/appError');

class ServiceService {
  /**
   * Helper to format Prisma service object with clean numeric price.
   */
  _formatService(service) {
    if (!service) return null;
    return {
      id: service.id,
      providerId: service.providerId,
      categoryId: service.categoryId,
      title: service.title,
      description: service.description,
      price: parseFloat(service.price),
      durationMinutes: service.durationMinutes,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      ...(service.category && { category: service.category }),
      ...(service.provider && { provider: service.provider }),
    };
  }

  /**
   * Create a new service under the authenticated provider.
   * @param {number} providerId
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createService(providerId, data) {
    // 1. Verify category exists
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // 2. Persist service in database
    const newService = await serviceRepository.createService({
      providerId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      price: data.price,
      durationMinutes: data.durationMinutes,
    });

    return this._formatService(newService);
  }

  /**
   * Get all services owned by the authenticated provider with pagination.
   * @param {number} providerId
   * @param {Object} pagination
   * @returns {Promise<{ items: Array<Object>, pagination: Object }>}
   */
  async getProviderServices(providerId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [items, totalItems] = await Promise.all([
      serviceRepository.findServicesByProvider(providerId, { skip, take }),
      serviceRepository.countServicesByProvider(providerId),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items: items.map((item) => this._formatService(item)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * Get a single service by ID. Inactive services are hidden unless accessed by the owner.
   * @param {number} id
   * @param {Object} context - { requestingUser: { id, role } | null }
   * @returns {Promise<Object>}
   */
  async getServiceById(id, context = {}) {
    const service = await serviceRepository.findServiceById(id);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Inactive service visibility rule:
    // Inactive services are hidden from public view unless the requesting user is the owning provider
    if (!service.isActive) {
      const isOwner =
        context.requestingUser &&
        context.requestingUser.role === 'PROVIDER' &&
        context.requestingUser.id === service.providerId;

      if (!isOwner) {
        throw new AppError('Service not found', 404);
      }
    }

    return this._formatService(service);
  }

  /**
   * Query public service catalog with search, category filtering, price filtering, sorting, and pagination.
   * @param {Object} query
   * @returns {Promise<{ items: Array<Object>, pagination: Object }>}
   */
  async getPublicCatalog(query) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const take = limit;

    // 1. Build database filter criteria
    const where = {
      isActive: true, // Only active services in public catalog
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price.lte = query.maxPrice;
      }
    }

    // 2. Build sort order from allowlist
    let orderBy = { createdAt: 'desc' };
    if (query.sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (query.sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (query.sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (query.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    // 3. Query database concurrently
    const [items, totalItems] = await Promise.all([
      serviceRepository.findPublicServices({ where, orderBy, skip, take }),
      serviceRepository.countPublicServices({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items: items.map((item) => this._formatService(item)),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  /**
   * Update an existing service with strict provider ownership enforcement.
   * @param {number} serviceId
   * @param {number} providerId
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateService(serviceId, providerId, updateData) {
    const service = await serviceRepository.findServiceById(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Strict ownership verification
    if (service.providerId !== providerId) {
      throw new AppError('Access forbidden: you do not own this service', 403);
    }

    // Verify category if changed
    if (updateData.categoryId && updateData.categoryId !== service.categoryId) {
      const category = await categoryRepository.findById(updateData.categoryId);
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    const updated = await serviceRepository.updateService(serviceId, updateData);
    return this._formatService(updated);
  }

  /**
   * Soft-delete/deactivate a service with strict provider ownership enforcement.
   * @param {number} serviceId
   * @param {number} providerId
   * @returns {Promise<void>}
   */
  async deactivateService(serviceId, providerId) {
    const service = await serviceRepository.findServiceById(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Strict ownership verification
    if (service.providerId !== providerId) {
      throw new AppError('Access forbidden: you do not own this service', 403);
    }

    await serviceRepository.deactivateService(serviceId);
  }
}

module.exports = new ServiceService();
