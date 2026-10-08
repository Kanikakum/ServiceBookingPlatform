const bookingService = require('../services/booking.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Handle advisory slot availability lookup for a service.
 */
const getAvailability = async (req, res, next) => {
  try {
    const result = await bookingService.getAvailability(req.query);
    return ApiResponse.success(res, 'Slot availability retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle booking creation by an authenticated customer.
 */
const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user.id, req.body);
    return ApiResponse.success(res, 'Booking created successfully', booking, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle provider accepting a pending booking.
 */
const acceptBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.acceptBooking(req.params.id, req.user.id);
    return ApiResponse.success(res, 'Booking accepted successfully', { booking }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle provider rejecting a pending booking.
 */
const rejectBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.rejectBooking(req.params.id, req.user.id);
    return ApiResponse.success(res, 'Booking rejected successfully', { booking }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle customer cancelling an active booking.
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user.id);
    return ApiResponse.success(res, 'Booking cancelled successfully', { booking }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle customer retrieving their own booking history.
 */
const getCustomerBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getCustomerBookings(req.user.id, req.query);
    return ApiResponse.success(res, 'Customer bookings retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle provider retrieving bookings scheduled for their services.
 */
const getProviderBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getProviderBookings(req.user.id, req.query);
    return ApiResponse.success(res, 'Provider bookings retrieved successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailability,
  createBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  getCustomerBookings,
  getProviderBookings,
};
