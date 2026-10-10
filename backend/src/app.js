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
  'https://service-booking-platform-gilt.vercel.app',
  'https://service-booking-platform-q9rj8jax4-kanikakumams-projects.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
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
