const crypto = require('crypto');
const axios = require('axios');

// Generate unique code
exports.generateUniqueCode = (prefix = '') => {
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  return prefix ? `${prefix}_${code}` : code;
};

// Get geo location from IP
exports.getGeoLocation = async (ip) => {
  try {
    // Skip for local IPs
    if (ip === '::1' || ip === '127.0.0.1') {
      return { country: 'Local', city: 'Local' };
    }
    
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    if (response.data.status === 'success') {
      return {
        country: response.data.country,
        city: response.data.city,
        region: response.data.regionName,
        lat: response.data.lat,
        lon: response.data.lon
      };
    }
    return { country: 'Unknown', city: 'Unknown' };
  } catch (error) {
    console.error('Geo location error:', error);
    return { country: 'Unknown', city: 'Unknown' };
  }
};

// Format currency
exports.formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Calculate percentage
exports.calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return (value / total) * 100;
};

// Format date
exports.formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

// Validate email
exports.validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Mask sensitive data
exports.maskString = (str, visibleChars = 4) => {
  if (!str) return '';
  if (str.length <= visibleChars) return '*'.repeat(str.length);
  return str.slice(0, visibleChars) + '*'.repeat(str.length - visibleChars);
};