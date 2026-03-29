module.exports = {
  USER_ROLES: {
    AFFILIATE: 'affiliate',
    ADMIN: 'admin',
    MANAGER: 'manager'
  },
  
  AFFILIATE_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended'
  },
  
  COMMISSION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    PAID: 'paid',
    CANCELLED: 'cancelled'
  },
  
  COMMISSION_TYPES: {
    FLAT: 'flat',
    PERCENTAGE: 'percentage',
    HYBRID: 'hybrid'
  },
  
  PAYMENT_METHODS: {
    PAYPAL: 'PayPal',
    BANK_TRANSFER: 'Bank Transfer',
    UPI: 'UPI'
  },
  
  PAYOUT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  
  CONVERSION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FRAUD: 'fraud'
  },
  
  COOKIE_DURATION: {
    DEFAULT: 30, // days
    MIN: 1,
    MAX: 365
  },
  
  MIN_PAYOUT_AMOUNT: 50,
  TDS_RATE: 10, // percentage
  
  // Error messages
  ERRORS: {
    UNAUTHORIZED: 'Not authorized to access this resource',
    INVALID_TOKEN: 'Invalid or expired token',
    USER_NOT_FOUND: 'User not found',
    AFFILIATE_NOT_FOUND: 'Affiliate profile not found',
    LINK_NOT_FOUND: 'Link not found',
    CONVERSION_NOT_FOUND: 'Conversion not found',
    INSUFFICIENT_BALANCE: 'Insufficient balance for payout',
    MIN_PAYOUT_NOT_MET: `Minimum payout amount is $${module.exports.MIN_PAYOUT_AMOUNT}`
  }
};