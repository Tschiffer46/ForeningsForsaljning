// Form validation utilities

export const validators = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },

  email: (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email address';
    }
    return null;
  },

  phone: (value) => {
    if (value && !/^[\d\s\-+()]+$/.test(value)) {
      return 'Invalid phone number';
    }
    return null;
  },

  number: (value) => {
    if (value && isNaN(Number(value))) {
      return 'Must be a valid number';
    }
    return null;
  },

  positiveNumber: (value) => {
    if (value && (isNaN(Number(value)) || Number(value) < 0)) {
      return 'Must be a positive number';
    }
    return null;
  },

  integer: (value) => {
    if (value && !Number.isInteger(Number(value))) {
      return 'Must be a whole number';
    }
    return null;
  },

  min: (minimum) => (value) => {
    if (value && Number(value) < minimum) {
      return `Must be at least ${minimum}`;
    }
    return null;
  },

  max: (maximum) => (value) => {
    if (value && Number(value) > maximum) {
      return `Must be no more than ${maximum}`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message || 'Invalid format';
    }
    return null;
  },
};

export const validate = (value, validatorFunctions) => {
  for (const validator of validatorFunctions) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return null;
};

export const validateForm = (formData, fieldValidations) => {
  const errors = {};
  let isValid = true;

  Object.keys(fieldValidations).forEach(field => {
    const value = formData[field];
    const validatorFunctions = fieldValidations[field];
    const error = validate(value, validatorFunctions);
    
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Product-specific validations
export const productValidations = {
  name: [validators.required, validators.minLength(2), validators.maxLength(100)],
  price: [validators.required, validators.positiveNumber],
  subscription_price: [validators.positiveNumber],
  sacks_per_pallet: [validators.required, validators.positiveNumber, validators.integer],
};

// Team-specific validations
export const teamValidations = {
  name: [validators.required, validators.minLength(2), validators.maxLength(100)],
  username: [validators.required, validators.minLength(3), validators.maxLength(50)],
  password: [validators.required, validators.minLength(6)],
};

// Customer-specific validations
export const customerValidations = {
  name: [validators.required, validators.minLength(2), validators.maxLength(100)],
  customer_number: [validators.required],
  phone: [validators.phone],
  email: [validators.email],
  address: [validators.required],
  postal_code: [validators.required],
  city: [validators.required],
};

// Area-specific validations
export const areaValidations = {
  name: [validators.required, validators.minLength(2), validators.maxLength(100)],
  description: [validators.maxLength(500)],
};
