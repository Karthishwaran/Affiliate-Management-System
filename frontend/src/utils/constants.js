export const USER_ROLES = {
  AFFILIATE: 'affiliate',
  ADMIN: 'admin',
  MANAGER: 'manager'
};

export const AFFILIATE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

export const COMMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

export const PAYMENT_METHODS = {
  PAYPAL: 'PayPal',
  BANK_TRANSFER: 'Bank Transfer',
  UPI: 'UPI'
};

export const NICHE_OPTIONS = [
  'Technology',
  'Fashion',
  'Health',
  'Finance',
  'Gaming',
  'Travel',
  'Education',
  'Other'
];

export const PROMOTION_METHODS = [
  'Blog',
  'Social Media',
  'Email Marketing',
  'YouTube',
  'Paid Ads',
  'Other'
];

export const CHART_COLORS = {
  primary: '#4e73df',
  success: '#1cc88a',
  info: '#36b9cc',
  warning: '#f6c23e',
  danger: '#e74a3b',
  secondary: '#858796'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token'
  },
  AFFILIATE: {
    DASHBOARD: '/affiliate/dashboard/stats',
    PROFILE: '/affiliate/profile',
    KYC_UPLOAD: '/affiliate/kyc/upload',
    PERFORMANCE: '/affiliate/performance/metrics'
  },
  LINKS: {
    BASE: '/links',
    CREATE: '/links/create',
    STATS: (id) => `/links/${id}/stats`
  },
  COMMISSIONS: {
    BASE: '/commissions',
    SUMMARY: '/commissions/summary'
  },
  PAYOUTS: {
    BASE: '/payouts',
    REQUEST: '/payouts/request'
  },
  CREATIVES: {
    BASE: '/creatives',
    CODE: (id) => `/creatives/${id}/code`
  },
  REPORTS: {
    AFFILIATE: '/reports/affiliate',
    ADMIN: '/reports/admin'
  }
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 25, 50, 100]
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme'
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY HH:mm',
  TIME: 'HH:mm'
};

export const MIN_PAYOUT_AMOUNT = 50;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];