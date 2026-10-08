const config = require('../config/config');

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const targetField = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    message = `A record with this ${targetField} already exists.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record was not found.';
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body.';
  }

  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  // Only include stack trace if explicitly in development and error is unexpected (500)
  if (config.env === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
