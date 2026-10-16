import type { LoginCredentials, RegisterPayload } from '../types/auth.types';

export type FieldErrors = Record<string, string>;

// These limits mirror the backend DTO constraints (RegisterRequest / LoginRequest).
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Same expression as com.lms.util.PhoneNumbers.PATTERN: 8-15 digits, optional leading +. */
const PHONE_PATTERN = /^(?=(?:\D*\d){8,15}\D*$)\+?[0-9\s().-]+$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(trimmed);
}

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value.trim());
}

/** Local-calendar date as yyyy-mm-dd. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Latest selectable date of birth: yesterday (backend requires a past date). */
export function latestDateOfBirth(now: Date = new Date()): string {
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return toIsoDate(yesterday);
}

function isRealCalendarDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function validateLogin(values: LoginCredentials): FieldErrors {
  const errors: FieldErrors = {};
  const identifier = values.identifier.trim();

  if (!identifier) {
    errors.identifier = 'Enter your email or phone number';
  } else if (identifier.includes('@')) {
    if (!isValidEmail(identifier)) {
      errors.identifier = 'Enter a valid email address or phone number';
    }
  } else if (!isValidPhone(identifier)) {
    errors.identifier = 'Enter a valid email address or phone number';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
}

export type RegisterValues = RegisterPayload & { confirmPassword: string };

export function validateRegister(values: RegisterValues, now: Date = new Date()): FieldErrors {
  const errors: FieldErrors = {};

  const firstName = values.firstName.trim();
  if (!firstName) {
    errors.firstName = 'First name is required';
  } else if (firstName.length > NAME_MAX_LENGTH) {
    errors.firstName = `First name must be at most ${NAME_MAX_LENGTH} characters`;
  }

  const lastName = values.lastName.trim();
  if (!lastName) {
    errors.lastName = 'Last name is required';
  } else if (lastName.length > NAME_MAX_LENGTH) {
    errors.lastName = `Last name must be at most ${NAME_MAX_LENGTH} characters`;
  }

  const phone = values.phoneNumber.trim();
  if (!phone) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!isValidPhone(phone)) {
    errors.phoneNumber = 'Enter a valid phone number (8-15 digits, e.g. +84 912 345 678)';
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else if (!isRealCalendarDate(values.dateOfBirth)) {
    errors.dateOfBirth = 'Enter a valid date of birth';
  } else if (values.dateOfBirth > latestDateOfBirth(now)) {
    errors.dateOfBirth = 'Date of birth must be in the past';
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  } else if (values.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Password must be at most ${PASSWORD_MAX_LENGTH} characters`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (values.avatarUrl && values.avatarUrl.length > 2048) {
    errors.avatarUrl = 'Avatar URL must be at most 2048 characters';
  }

  return errors;
}
