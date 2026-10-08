const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const serviceRoutes = require('./service.routes');
const categoryRoutes = require('./category.routes');

const router = express.Router();

// Mount sub-routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
