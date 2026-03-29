const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;
let isConnecting = false;

const connectRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  if (isConnecting) {
    // Wait for connection to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    return redisClient;
  }

  isConnecting = true;

  try {
    const redisConfig = {
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    };

    if (process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    redisClient = redis.createClient(redisConfig);
    
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
      console.error('Redis error:', err.message);
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
      console.log('✅ Redis connected');
    });
    
    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting');
    });
    
    await redisClient.connect();
    isConnecting = false;
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    console.error('Redis connection failed:', error.message);
    isConnecting = false;
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client not initialized or not connected');
  }
  return redisClient;
};

const setCache = async (key, value, expirySeconds = 3600) => {
  try {
    const client = await connectRedis();
    if (!client) return false;
    
    const serialized = JSON.stringify(value);
    await client.setEx(key, expirySeconds, serialized);
    return true;
  } catch (error) {
    logger.error('Redis set cache error:', error);
    return false;
  }
};

const getCache = async (key) => {
  try {
    const client = await connectRedis();
    if (!client) return null;
    
    const data = await client.get(key);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    logger.error('Redis get cache error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    const client = await connectRedis();
    if (!client) return false;
    
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete cache error:', error);
    return false;
  }
};

const clearCache = async (pattern) => {
  try {
    const client = await connectRedis();
    if (!client) return false;
    
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    logger.error('Redis clear cache error:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  clearCache
};