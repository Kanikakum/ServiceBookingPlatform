const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generate a JWT with minimal, non-sensitive payload claims.
 * @param {Object} payload - { userId: number, role: string }
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
    }
  );
};

/**
 * Verify and decode a JWT token.
 * @param {string} token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
