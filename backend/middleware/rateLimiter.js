const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  }
});

// API rate limiter for tracking endpoints
const trackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    success: false,
    message: 'Too many tracking requests.'
  }
});

// Create Redis store for production
const createRedisStore = () => {
  try {
    const redisClient = getRedisClient();
    return new RedisStore({
      client: redisClient,
      prefix: 'rate_limit:'
    });
  } catch (error) {
    console.error('Redis store creation failed, using memory store');
    return undefined;
  }
};

// Dynamic rate limiter with Redis
const createRateLimiter = (options) => {
  const store = process.env.NODE_ENV === 'production' ? createRedisStore() : undefined;
  
  return rateLimit({
    store,
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      message: 'Too many requests, please try again later.'
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip;
    },
    skip: (req) => {
      // Skip rate limiting for admins
      return req.user?.role === 'admin';
    }
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  trackingLimiter,
  createRateLimiter
};