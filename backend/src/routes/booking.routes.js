const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { validate, validateQuery, validateParams } = require('../middleware/validate.middleware');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const {
  createBookingSchema,
  availabilityQuerySchema,
  bookingFilterQuerySchema,
  bookingIdParamSchema,
} = require('../validators/booking.validator');

const router = express.Router();

// ==========================================
// 1. Specific Static & Collection Routes (MUST precede /:id)
// ==========================================

// Check slot availability for a service
router.get(
  '/availability',
  requireAuth,
  requireRole('CUSTOMER'),
  validateQuery(availabilityQuerySchema),
  bookingController.getAvailability
);

// Create new booking (Customer only)
router.post(
  '/',
  requireAuth,
  requireRole('CUSTOMER'),
  validate(createBookingSchema),
  bookingController.createBooking
);

// Provider list of scheduled bookings
router.get(
  '/provider',
  requireAuth,
  requireRole('PROVIDER'),
  validateQuery(bookingFilterQuerySchema),
  bookingController.getProviderBookings
);

// Customer list of personal bookings
router.get(
  '/customer',
  requireAuth,
  requireRole('CUSTOMER'),
  validateQuery(bookingFilterQuerySchema),
  bookingController.getCustomerBookings
);

// ==========================================
// 2. Specific Parameterized Action Routes (/:id/action)
// ==========================================

// Provider accepts a pending booking
router.patch(
  '/:id/accept',
  requireAuth,
  requireRole('PROVIDER'),
  validateParams(bookingIdParamSchema),
  bookingController.acceptBooking
);

// Provider rejects a pending booking
router.patch(
  '/:id/reject',
  requireAuth,
  requireRole('PROVIDER'),
  validateParams(bookingIdParamSchema),
  bookingController.rejectBooking
);

// Customer cancels an active booking
router.patch(
  '/:id/cancel',
  requireAuth,
  requireRole('CUSTOMER'),
  validateParams(bookingIdParamSchema),
  bookingController.cancelBooking
);

module.exports = router;
