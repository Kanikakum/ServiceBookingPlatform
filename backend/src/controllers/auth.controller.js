const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Handle user registration (Customer or Provider).
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return ApiResponse.success(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login.
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return ApiResponse.success(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle retrieving current authenticated user profile.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return ApiResponse.success(res, 'User profile retrieved successfully', { user }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
