const prisma = require('../db/prisma');

class UserRepository {
  /**
   * Find a user by their unique email address.
   * @param {string} email
   * @returns {Promise<import('@prisma/client').User | null>}
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find a user by primary key ID.
   * @param {number} id
   * @returns {Promise<import('@prisma/client').User | null>}
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Create a new user record.
   * @param {Object} userData - { name, email, passwordHash, role }
   * @returns {Promise<import('@prisma/client').User>}
   */
  async create(userData) {
    return prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        passwordHash: userData.passwordHash,
        role: userData.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

module.exports = new UserRepository();
