const categoryRepository = require('../repositories/category.repository');

class CategoryService {
  /**
   * Retrieve all available service categories.
   * @returns {Promise<Array<Object>>}
   */
  async getAllCategories() {
    return categoryRepository.findAll();
  }

  /**
   * Retrieve category by ID.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async getCategoryById(id) {
    return categoryRepository.findById(id);
  }
}

module.exports = new CategoryService();
