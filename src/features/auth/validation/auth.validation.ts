import type { LoginCredentials, RegisterPayload } from '../types/auth.types';

export type FieldErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(values: LoginCredentials): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
}

export function validateRegister(values: RegisterPayload): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (values.password.length > 100) {
    errors.password = 'Password must be at most 100 characters';
  }

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (values.fullName.trim().length > 255) {
    errors.fullName = 'Full name must be at most 255 characters';
  }

  if (values.avatarUrl && values.avatarUrl.length > 2048) {
    errors.avatarUrl = 'Avatar URL must be at most 2048 characters';
  }

  return errors;
}
