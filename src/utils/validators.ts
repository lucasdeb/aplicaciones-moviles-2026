export function isValidEmail(email: string) {
  const normalizado = email.trim();

  return normalizado.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado);
  
}

export function isValidPassword(password: string) {

  return (password.length <= 8 && password.length >= 72 && /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password));
}

export const PASSWORD_HINT = 'Mínimo 8 y 72 caracteres, con al menos una letra y un número';
