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
      form: 'Unable to reach the server. Check your connection and try again.',
      fields: {},
    };
  }

  if (error.status === 400) {
    const fields = parseValidationDetails(error.body?.details);
    return {
      form:
        Object.keys(fields).length > 0
          ? null
          : 'The submitted information is not valid. Please check it and try again.',
      fields,
    };
  }

  if (error.status === 401 && kind === 'login') {
    return { form: 'Invalid email/phone number or password.', fields: {} };
  }

  if (error.status === 409 && kind === 'register') {
    const fields = parseValidationDetails(error.body?.details);
    if (fields.email) {
      fields.email = 'An account with this email already exists.';
    }
    if (fields.phoneNumber) {
      fields.phoneNumber = 'An account with this phone number already exists.';
    }
    if (Object.keys(fields).length === 0) {
      // Older/opaque 409: fall back to the message text.
      if (/phone/i.test(error.message)) {
        fields.phoneNumber = 'An account with this phone number already exists.';
      } else {
        fields.email = 'An account with this email already exists.';
      }
    }
    return { form: null, fields };
  }

  return { form: 'Something went wrong. Please try again later.', fields: {} };
}
