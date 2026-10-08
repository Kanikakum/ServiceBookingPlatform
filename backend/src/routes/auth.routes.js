const express = require('express');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

// Public auth routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected auth routes
router.get('/me', requireAuth, authController.getMe);

// Role-protected test routes for authorization verification
router.get('/test-customer-only', requireAuth, requireRole('CUSTOMER'), (req, res) => {
  return ApiResponse.success(res, 'Customer authorized access', { user: req.user });
});

router.get('/test-provider-only', requireAuth, requireRole('PROVIDER'), (req, res) => {
  return ApiResponse.success(res, 'Provider authorized access', { user: req.user });
});

module.exports = router;
