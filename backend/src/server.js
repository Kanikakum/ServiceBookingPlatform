const app = require('./app');
const config = require('./config/config');

const server = app.listen(config.port, () => {
  console.log(`[Backend] Server listening on port ${config.port} in ${config.env} mode`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n[Backend] ${signal} signal received: closing HTTP server`);
  server.close(() => {
    console.log('[Backend] HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
