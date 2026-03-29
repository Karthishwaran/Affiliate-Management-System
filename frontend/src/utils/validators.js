export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validatePhone = (phone) => {
  if (!phone) return true;
  const re = /^[0-9+\-\s()]+$/;
  return re.test(phone);
};

export const validateURL = (url) => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateAmount = (amount, min = 0, max = Infinity) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  for (const [field, value] of Object.entries(data)) {
    if (rules[field]) {
      const { required, validator, message } = rules[field];
      
      if (required && !value) {
        errors[field] = message || `${field} is required`;
      } else if (value && validator && !validator(value)) {
        errors[field] = message || `${field} is invalid`;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

export const validateAffiliateProfile = (data) => {
  const errors = {};
  
  if (data.website && !validateURL(data.website)) {
    errors.website = 'Please enter a valid URL';
  }
  
  if (data.paymentEmail && !validateEmail(data.paymentEmail)) {
    errors.paymentEmail = 'Please enter a valid email';
  }
  
  if (data.audienceSize && (data.audienceSize < 0 || !Number.isInteger(Number(data.audienceSize)))) {
    errors.audienceSize = 'Please enter a valid number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};


export const validateDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};