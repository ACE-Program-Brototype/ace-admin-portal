export interface PasswordCriteriaItem {
  id: string;
  label: string;
  met: boolean;
}

export const getPasswordCriteria = (pwd: string): PasswordCriteriaItem[] => [
  { id: 'length', label: 'At least 8 characters', met: pwd.length >= 8 },
  { id: 'number', label: 'One number (0-9)', met: /[0-9]/.test(pwd) },
  { id: 'lowercase', label: 'One small letter (a-z)', met: /[a-z]/.test(pwd) },
  { id: 'uppercase', label: 'One capital letter (A-Z)', met: /[A-Z]/.test(pwd) },
  { id: 'special', label: 'One special character (!@#$...)', met: /[^a-zA-Z0-9\s]/.test(pwd) },
  { id: 'no-space', label: 'No empty spaces', met: pwd.length > 0 && !/\s/.test(pwd) }
];

export const validatePassword = (pwd: string): { isValid: boolean; message?: string } => {
  if (!pwd) {
    return { isValid: false, message: 'Password is required.' };
  }
  if (pwd.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (/\s/.test(pwd)) {
    return { isValid: false, message: 'Password must not contain empty spaces.' };
  }
  if (!/[a-z]/.test(pwd)) {
    return { isValid: false, message: 'Password must contain at least one small (lowercase) letter.' };
  }
  if (!/[A-Z]/.test(pwd)) {
    return { isValid: false, message: 'Password must contain at least one capital (uppercase) letter.' };
  }
  if (!/[0-9]/.test(pwd)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }
  if (!/[^a-zA-Z0-9\s]/.test(pwd)) {
    return { isValid: false, message: 'Password must contain at least one special character (e.g. !@#$%^&*).' };
  }
  return { isValid: true };
};
