export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Seguridad básica: mínimo 8 caracteres, con al menos una letra y un número.
export function isValidPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

export const PASSWORD_HINT = 'Mínimo 8 caracteres, con al menos una letra y un número';
