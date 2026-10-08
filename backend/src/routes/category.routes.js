const express = require('express');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

// Public route to list all categories
router.get('/', categoryController.getCategories);

module.exports = router;
