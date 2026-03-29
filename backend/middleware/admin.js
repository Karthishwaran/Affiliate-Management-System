// Admin middleware - checks if user has admin role
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Manager middleware - checks if user is admin or manager
const managerMiddleware = (req, res, next) => {
  if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manager privileges required.'
    });
  }
  next();
};

module.exports = {
  adminMiddleware,
  managerMiddleware
};