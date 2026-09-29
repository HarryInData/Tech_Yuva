const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Tech Yuva Backend Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
  logger.info(`📡 API endpoint: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
  logger.info(`🩺 Health check: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`);
});

// Process event listeners for graceful shutdown
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise);
  logger.error('Reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
