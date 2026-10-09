const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();

// Security and utility middleware

const allowedOrigins = [
  'http://localhost:3000',
  'https://service-booking-platform-q9rj8jax4-kanikakums-projects.vercel.app',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Service Booking Platform API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

module.exports = app;
