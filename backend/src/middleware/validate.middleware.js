const AppError = require('../utils/appError');

/**
 * Higher-order middleware to validate request bodies against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // Replace with sanitized/trimmed/coerced values
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return next(new AppError(formattedErrors[0]?.message || 'Validation Error', 400, formattedErrors));
    }
    next(new AppError('Invalid request payload', 400));
  }
};

module.exports = validate;
