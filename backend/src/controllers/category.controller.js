const categoryService = require('../services/category.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Handle retrieving all categories.
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    return ApiResponse.success(res, 'Categories retrieved successfully', { categories }, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
};
