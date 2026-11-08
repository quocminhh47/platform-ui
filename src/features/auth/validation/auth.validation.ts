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
    errors.identifier = 'Nhập email hoặc số điện thoại';
  } else if (identifier.includes('@')) {
    if (!isValidEmail(identifier)) {
      errors.identifier = 'Email hoặc số điện thoại không hợp lệ';
    }
  } else if (!isValidPhone(identifier)) {
    errors.identifier = 'Email hoặc số điện thoại không hợp lệ';
  }

  if (!values.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  }

  return errors;
}

export type RegisterValues = RegisterPayload & { confirmPassword: string };

export function validateRegister(values: RegisterValues, now: Date = new Date()): FieldErrors {
  const errors: FieldErrors = {};

  const firstName = values.firstName.trim();
  if (!firstName) {
    errors.firstName = 'Vui lòng nhập họ';
  } else if (firstName.length > NAME_MAX_LENGTH) {
    errors.firstName = `Họ tối đa ${NAME_MAX_LENGTH} ký tự`;
  }

  const lastName = values.lastName.trim();
  if (!lastName) {
    errors.lastName = 'Vui lòng nhập tên';
  } else if (lastName.length > NAME_MAX_LENGTH) {
    errors.lastName = `Tên tối đa ${NAME_MAX_LENGTH} ký tự`;
  }

  const phone = values.phoneNumber.trim();
  if (!phone) {
    errors.phoneNumber = 'Vui lòng nhập số điện thoại';
  } else if (!isValidPhone(phone)) {
    errors.phoneNumber = 'Số điện thoại không hợp lệ (8–15 chữ số, vd. +84 912 345 678)';
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = 'Vui lòng chọn ngày sinh';
  } else if (!isRealCalendarDate(values.dateOfBirth)) {
    errors.dateOfBirth = 'Ngày sinh không hợp lệ';
  } else if (values.dateOfBirth > latestDateOfBirth(now)) {
    errors.dateOfBirth = 'Ngày sinh phải là ngày trong quá khứ';
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Vui lòng nhập email';
  } else if (!isValidEmail(email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!values.password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`;
  } else if (values.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }

  if (values.avatarUrl && values.avatarUrl.length > 2048) {
    errors.avatarUrl = 'URL ảnh đại diện tối đa 2048 ký tự';
  }

  return errors;
}
