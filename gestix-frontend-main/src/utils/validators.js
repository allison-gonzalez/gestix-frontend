export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validateRequired = (value) => value !== null && value !== undefined && value !== '';
export const validateMinLength = (value, min) => value && value.length >= min;
export const validateMaxLength = (value, max) => !value || value.length <= max;
