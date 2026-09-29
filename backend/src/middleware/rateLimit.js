const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const isTest = env.NODE_ENV === 'test';

// General API rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// Strict limiter for submissions (join community, contact form, event RSVP): 15 per hour
const strictFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTest ? 10000 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Submission limit reached. Please wait before submitting another request.',
  },
});

module.exports = {
  generalLimiter,
  strictFormLimiter,
};
