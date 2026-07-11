export const PASSWORD_POLICY =
  'La contraseña debe tener al menos 6 caracteres; contener una mayúscula, un número y un carácter especial.';

export function isPasswordPolicyCompliant(password: string): boolean {
  if (password.length < 6) {
    return false;
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasNonAlphanumeric = /\W/.test(password);

  return hasUpperCase && hasLowerCase && hasDigit && hasNonAlphanumeric;
}
