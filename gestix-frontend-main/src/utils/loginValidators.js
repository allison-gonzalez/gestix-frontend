/**
 * Validaciones para el login
 */

/**
 * Valida que el email sea válido
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const validatePassword = (password) => {
  const errors = [];
  let strength = 'weak';

  if (password.length < 8) {
    errors.push('La contraseña debe tener mínimo 8 caracteres');
  }

  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*)');
  }

  const emojiRegex =
    /(\u00d83d[\ude00-\ude4f])|(\u00d83c[\udf00-\uifff])|(\u00d83d[\ude80-\udeff])|(\u00d83e[\udd00-\uddff])/g;
  if (emojiRegex.test(password)) {
    errors.push('La contraseña no puede contener emojis');
  }

  if (errors.length === 0) {
    strength = 'strong';
    if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) {
      strength = 'very-strong';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};


export const getPasswordError = (password) => {
  const validation = validatePassword(password);
  return validation.errors.length > 0 ? validation.errors[0] : '';
};


export const getPasswordRequirements = (password) => {
  return {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noEmoji: !/(\u00d83d[\ude00-\ude4f])|(\u00d83c[\udf00-\uifff])|(\u00d83d[\ude80-\udeff])|(\u00d83e[\udd00-\uddff])/g.test(
      password
    ),
  };
};


export const validateLoginForm = (formData) => {
  const errors = {};

  if (!formData.email) {
    errors.email = 'El email es requerido';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'El email no es válido';
  }

  if (!formData.password) {
    errors.password = 'La contraseña es requerida';
  } else {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
