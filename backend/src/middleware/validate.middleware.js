const AppError = require('../utils/appError');

/**
 * Helper to extract formatted error list from Zod error.
 */
const formatZodErrors = (error) => {
  const issues = error.issues || error.errors || [];
  return issues.map((err) => ({
    field: err.path ? err.path.join('.') : 'field',
    message: err.message,
  }));
};

/**
 * Middleware to validate request bodies against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    const formattedErrors = formatZodErrors(error);
    if (formattedErrors.length > 0) {
      return next(new AppError(formattedErrors[0].message, 400, formattedErrors));
    }
    next(new AppError('Invalid request payload', 400));
  }
};

/**
 * Middleware to validate request query parameters against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query);
    req.query = parsed;
    next();
  } catch (error) {
    const formattedErrors = formatZodErrors(error);
    if (formattedErrors.length > 0) {
      return next(new AppError(formattedErrors[0].message, 400, formattedErrors));
    }
    next(new AppError('Invalid query parameters', 400));
  }
};

/**
 * Middleware to validate request path parameters against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
const validateParams = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.params);
    req.params = parsed;
    next();
  } catch (error) {
    const formattedErrors = formatZodErrors(error);
    if (formattedErrors.length > 0) {
      return next(new AppError(formattedErrors[0].message, 400, formattedErrors));
    }
    next(new AppError('Invalid URL parameters', 400));
  }
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
};
