const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  let error = err;

  // Handle non-ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle unique constraint violations from Postgres
  if (err.code === '23505') {
    error.statusCode = 409;
    error.message = 'A record with these details already exists.';
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(env.NODE_ENV !== 'production' && { stack: error.stack }),
  };

  logger.error(`[${req.method}] ${req.originalUrl} - ${error.statusCode}: ${error.message}`);

  res.status(error.statusCode).json(response);
}

module.exports = errorHandler;
