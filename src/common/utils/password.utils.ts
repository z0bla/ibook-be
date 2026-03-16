// src/common/utils/password.utils.ts

export function isValidPassword(password: string): boolean {
  // Minimum 8 characters, at least one letter, one number, one special char
  const regex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return regex.test(password);
}

export function isPasswordNotEmail(password: string, email: string): boolean {
  return password.toLowerCase() !== email.toLowerCase();
}
