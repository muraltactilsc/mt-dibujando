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
