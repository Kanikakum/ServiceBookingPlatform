const serviceService = require('../services/service.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Handle service creation by an authenticated provider.
 */
const createService = async (req, res, next) => {
  try {
    const service = await serviceService.createService(req.user.id, req.body);
    return ApiResponse.success(res, 'Service created successfully', service, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle fetching services owned by the authenticated provider.
 */
const getProviderServices = async (req, res, next) => {
  try {
    const result = await serviceService.getProviderServices(req.user.id, req.query);
    return ApiResponse.success(res, 'Provider services retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle fetching single service details.
 */
const getServiceById = async (req, res, next) => {
  try {
    const service = await serviceService.getServiceById(req.params.id, {
      requestingUser: req.user,
    });
    return ApiResponse.success(res, 'Service details retrieved successfully', { service }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle fetching public service catalog with search, filters, sorting, and pagination.
 */
const getPublicCatalog = async (req, res, next) => {
  try {
    const result = await serviceService.getPublicCatalog(req.query);
    return ApiResponse.success(res, 'Services retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle updating an existing service by its owner.
 */
const updateService = async (req, res, next) => {
  try {
    const service = await serviceService.updateService(req.params.id, req.user.id, req.body);
    return ApiResponse.success(res, 'Service updated successfully', { service }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle soft-deleting/deactivating an existing service by its owner.
 */
const deactivateService = async (req, res, next) => {
  try {
    await serviceService.deactivateService(req.params.id, req.user.id);
    return ApiResponse.success(res, 'Service deactivated successfully', null, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createService,
  getProviderServices,
  getServiceById,
  getPublicCatalog,
  updateService,
  deactivateService,
};
