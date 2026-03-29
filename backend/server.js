const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const passport = require('passport');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Import configurations
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const affiliateRoutes = require('./routes/affiliate');
const linkRoutes = require('./routes/links');
const trackingRoutes = require('./routes/tracking');
const commissionRoutes = require('./routes/commissions');
const payoutRoutes = require('./routes/payouts');
const adminRoutes = require('./routes/admin');
const creativeRoutes = require('./routes/creatives');
const reportRoutes = require('./routes/reports');
const testRoutes = require('./routes/test');

const app = express();

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Configure CORS - SINGLE CONFIGURATION (REMOVED THE DUPLICATE)
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      undefined // Allow requests with no origin (like Postman)
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
};

// Middleware - Use CORS first
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(limiter);
app.use(passport.initialize());

// Passport configuration
require('./config/passport')(passport);

// Root endpoint - must be before other routes
app.get('/', (req, res) => {
  res.json({
    name: 'Affiliate Management System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: {
        auth: '/api/auth',
        affiliate: '/api/affiliate',
        links: '/api/links',
        tracking: '/api/tracking',
        commissions: '/api/commissions',
        payouts: '/api/payouts',
        admin: '/api/admin',
        creatives: '/api/creatives',
        reports: '/api/reports',
        test: '/api/test'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes - Order matters, more specific routes first
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/creatives', creativeRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({ 
    success: false, 
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: {
      root: '/',
      health: '/health',
      api: {
        test: '/api/test/*',
        auth: '/api/auth/*',
        affiliate: '/api/affiliate/*',
        links: '/api/links/*',
        tracking: '/api/tracking/*',
        commissions: '/api/commissions/*',
        payouts: '/api/payouts/*',
        admin: '/api/admin/*',
        creatives: '/api/creatives/*',
        reports: '/api/reports/*'
      }
    }
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n=================================');
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoints: http://localhost:${PORT}/api/test/ping`);
  console.log('=================================\n');
  
  console.log('📋 Registered Routes:');
  console.log('  - GET  /');
  console.log('  - GET  /health');
  console.log('  - GET  /api/test/ping');
  console.log('  - GET  /api/test/db-status');
  console.log('  - POST /api/auth/register');
  console.log('  - POST /api/auth/login');
  console.log('  - GET  /api/affiliate/dashboard/stats');
  console.log('  - GET  /api/affiliate/profile');
  console.log('  - POST /api/links/create');
  console.log('  - GET  /track/click/:code');
  console.log('  - POST /api/tracking/conversion');
  console.log('  - and more...\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app;