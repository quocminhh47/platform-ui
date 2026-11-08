import { ApiError } from '../../../services/api/api-error';

export type FormErrors = {
  /** Message shown above the submit button. */
  form: string | null;
  /** Messages keyed by request field name. */
  fields: Record<string, string>;
};

type AuthFormKind = 'login' | 'register';

const KNOWN_FIELDS = new Set([
  'email',
  'password',
  'firstName',
  'lastName',
  'phoneNumber',
  'dateOfBirth',
  'identifier',
  'avatarUrl',
]);

/**
 * Backend 400 responses use `details: ["field: message", ...]`
 * (GlobalExceptionHandler.formatFieldError). Parses the known fields only.
 */
function parseValidationDetails(details: string[] | null | undefined): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const detail of details ?? []) {
    const separator = detail.indexOf(': ');
    if (separator <= 0) {
      continue;
    }
    const field = detail.slice(0, separator);
    if (KNOWN_FIELDS.has(field) && !(field in fields)) {
      fields[field] = detail.slice(separator + 2);
    }
  }
  return fields;
}

/**
 * Maps a failed login/register call to user-facing messages.
 * Never surfaces raw server bodies other than parsed validation messages.
 */
export function mapAuthError(error: unknown, kind: AuthFormKind): FormErrors {
  if (!(error instanceof ApiError)) {
    return {
      form: 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.',
      fields: {},
    };
  }

  if (error.status === 400) {
    const fields = parseValidationDetails(error.body?.details);
    return {
      form:
        Object.keys(fields).length > 0
          ? null
          : 'Thông tin không hợp lệ. Vui lòng kiểm tra và thử lại.',
      fields,
    };
  }

  if (error.status === 401 && kind === 'login') {
    return { form: 'Email/số điện thoại hoặc mật khẩu không đúng.', fields: {} };
  }

  if (error.status === 409 && kind === 'register') {
    const fields = parseValidationDetails(error.body?.details);
    if (fields.email) {
      fields.email = 'Email này đã được đăng ký.';
    }
    if (fields.phoneNumber) {
      fields.phoneNumber = 'Số điện thoại này đã được đăng ký.';
    }
    if (Object.keys(fields).length === 0) {
      if (/phone/i.test(error.message)) {
        fields.phoneNumber = 'Số điện thoại này đã được đăng ký.';
      } else {
        fields.email = 'Email này đã được đăng ký.';
      }
    }
    return { form: null, fields };
  }

  return { form: 'Đã xảy ra lỗi. Vui lòng thử lại sau.', fields: {} };
}
