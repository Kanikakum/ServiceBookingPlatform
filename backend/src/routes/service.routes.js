const express = require('express');
const serviceController = require('../controllers/service.controller');
const { validate, validateQuery, validateParams } = require('../middleware/validate.middleware');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth.middleware');
const {
  createServiceSchema,
  updateServiceSchema,
  queryCatalogSchema,
  providerPaginationSchema,
  serviceIdParamSchema,
} = require('../validators/service.validator');

const router = express.Router();

// ==========================================
// 1. Specific & Collection Routes (MUST precede /:id)
// ==========================================

// Public catalog search, filter, sort & pagination
router.get('/', validateQuery(queryCatalogSchema), serviceController.getPublicCatalog);

// Provider specific list of their own services
router.get(
  '/provider/me',
  requireAuth,
  requireRole('PROVIDER'),
  validateQuery(providerPaginationSchema),
  serviceController.getProviderServices
);

// Provider create service
router.post(
  '/',
  requireAuth,
  requireRole('PROVIDER'),
  validate(createServiceSchema),
  serviceController.createService
);

// ==========================================
// 2. Parameterized Single Service Routes (/:id)
// ==========================================

// Public get single service (with optional auth to allow owner to view deactivated service)
router.get(
  '/:id',
  optionalAuth,
  validateParams(serviceIdParamSchema),
  serviceController.getServiceById
);

// Provider update own service
router.put(
  '/:id',
  requireAuth,
  requireRole('PROVIDER'),
  validateParams(serviceIdParamSchema),
  validate(updateServiceSchema),
  serviceController.updateService
);

// Provider deactivate own service
router.delete(
  '/:id',
  requireAuth,
  requireRole('PROVIDER'),
  validateParams(serviceIdParamSchema),
  serviceController.deactivateService
);

module.exports = router;
