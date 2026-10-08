const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { generateToken } = require('../utils/token');
const AppError = require('../utils/appError');

class AuthService {
  /**
   * Register a new user (Customer or Provider).
   * @param {Object} data - { name, email, password, role }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async register({ name, email, password, role }) {
    // 1. Check for duplicate email
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    // 2. Hash password with bcrypt (salt rounds = 12)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Persist user via repository
    const newUser = await userRepository.create({
      name,
      email,
      passwordHash,
      role,
    });

    // 4. Generate JWT
    const token = generateToken({
      userId: newUser.id,
      role: newUser.role,
    });

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      token,
    };
  }

  /**
   * Authenticate a user with email and password.
   * @param {Object} data - { email, password }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async login({ email, password }) {
    // 1. Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 2. Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Retrieve the safe profile information for the authenticated user.
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

module.exports = new AuthService();
