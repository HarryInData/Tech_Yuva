const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimit');
const ApiError = require('./utils/ApiError');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error(`CORS error: Origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Request logging (skip in test environment)
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global rate limiting
app.use('/api', generalLimiter);

// API Versioned Routing
app.use(`/api/${env.API_VERSION}`, routes);

// Base route info
app.get('/', (req, res) => {
  res.json({
    name: 'Tech Yuva Platform API',
    tagline: 'Where Youth Meet to Build Future Tech',
    docs: `/api/${env.API_VERSION}/health`,
    version: env.API_VERSION,
    status: 'online',
  });
});

// 404 Route Not Found Handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
