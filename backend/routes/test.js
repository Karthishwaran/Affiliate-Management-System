const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Test database connection
router.get('/db-status', async (req, res) => {
  try {
    const status = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.models),
      uptime: process.uptime()
    };
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Simple test endpoint
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
    serverTime: new Date().toLocaleString()
  });
});

// Test all registered routes
router.get('/routes', (req, res) => {
  const routes = [];
  
  // Function to extract routes from router stack
  const extractRoutes = (stack, basePath = '') => {
    stack.forEach(layer => {
      if (layer.route) {
        // Routes registered directly on the router
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        routes.push({
          path: basePath + layer.route.path,
          methods: methods
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Nested routers
        const routerPath = basePath + (layer.regexp.source.replace(/\\/g, '').replace(/\^/g, '').replace(/\?/g, '').replace(/\//g, '/'));
        extractRoutes(layer.handle.stack, routerPath);
      }
    });
  };
  
  // This is a simplified version - in production you'd want to access the app's router stack
  res.json({
    success: true,
    message: 'Check server console for registered routes',
    note: 'Routes are registered in server.js'
  });
});

module.exports = router;