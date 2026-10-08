const prisma = require('../db/prisma');

class CategoryRepository {
  /**
   * Find all categories ordered alphabetically by name.
   * @returns {Promise<Array<import('@prisma/client').Category>>}
   */
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find a single category by ID.
   * @param {number} id
   * @returns {Promise<import('@prisma/client').Category | null>}
   */
  async findById(id) {
    return prisma.category.findUnique({
      where: { id: parseInt(id, 10) },
    });
  }

  /**
   * Find a category by unique slug.
   * @param {string} slug
   * @returns {Promise<import('@prisma/client').Category | null>}
   */
  async findBySlug(slug) {
    return prisma.category.findUnique({
      where: { slug },
    });
  }
}

module.exports = new CategoryRepository();
