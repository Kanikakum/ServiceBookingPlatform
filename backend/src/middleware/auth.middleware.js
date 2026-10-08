const { verifyToken } = require('../utils/token');
const AppError = require('../utils/appError');

/**
 * Middleware to authenticate requests via JWT Bearer token in the Authorization header.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError('Authentication required. Please provide a valid Bearer token.', 401)
    );
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(
      new AppError('Authentication token is missing.', 401)
    );
  }

  try {
    const decoded = verifyToken(token);
    
    // Attach verified identity context to request object
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Authentication token has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid authentication token.', 401));
  }
};

/**
 * Optional authentication middleware. Populates req.user if a valid token exists,
 * but allows unauthenticated requests to proceed.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };
  } catch (error) {
    // Silently ignore invalid token in optional auth
  }

  next();
};

/**
 * Higher-order middleware to enforce Role-Based Access Control (RBAC).
 * @param  {...string} allowedRoles - e.g. 'CUSTOMER', 'PROVIDER'
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return next(new AppError('Authentication required.', 401));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(
      new AppError(
        `Access forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`,
        403
      )
    );
  }

  next();
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
};
