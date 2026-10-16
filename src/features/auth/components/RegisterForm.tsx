import { useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mapAuthError } from '../validation/server-errors';
import {
  latestDateOfBirth,
  validateRegister,
  type FieldErrors,
  type RegisterValues,
} from '../validation/auth.validation';
import { FormField } from './FormField';
import { fieldDescribedBy } from './fieldDescribedBy';
import { PasswordInput } from './PasswordInput';

type FieldName = keyof RegisterValues;

const EMPTY: RegisterValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  dateOfBirth: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export function RegisterForm() {
  const { register } = useAuth();
  const [values, setValues] = useState<RegisterValues>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clientErrors = useMemo(() => validateRegister(values), [values]);
  const maxDob = useMemo(() => latestDateOfBirth(), []);

  function errorFor(field: FieldName): string | undefined {
    if (serverErrors[field]) {
      return serverErrors[field];
    }
    return submitAttempted || touched[field] ? clientErrors[field] : undefined;
  }

  function setField(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (serverErrors[field]) {
      setServerErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  function markTouched(field: FieldName) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setFormError(null);
    setSubmitAttempted(true);
    setServerErrors({});

    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    // confirmPassword is frontend-only and is never sent.
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phoneNumber: values.phoneNumber.trim(),
      dateOfBirth: values.dateOfBirth,
      email: values.email.trim(),
      password: values.password,
    };

    setSubmitting(true);
    try {
      await register(payload);
    } catch (error) {
      const mapped = mapAuthError(error, 'register');
      setServerErrors(mapped.fields);
      setFormError(mapped.form);
    } finally {
      setSubmitting(false);
    }
  }

  function text(field: FieldName, opts: { type?: string; autoComplete: string; placeholder: string; inputMode?: 'tel' | 'email' }) {
    const error = errorFor(field);
    return (
      <input
        id={`register-${field}`}
        type={opts.type ?? 'text'}
        inputMode={opts.inputMode}
        autoComplete={opts.autoComplete}
        placeholder={opts.placeholder}
        value={values[field]}
        onChange={(e) => setField(field, e.target.value)}
        onBlur={() => markTouched(field)}
        disabled={submitting}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(`register-${field}`, error)}
      />
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="field-row">
        <FormField id="register-firstName" label="First name" required error={errorFor('firstName')}>
          {text('firstName', { autoComplete: 'given-name', placeholder: 'e.g. Minh' })}
        </FormField>
        <FormField id="register-lastName" label="Last name" required error={errorFor('lastName')}>
          {text('lastName', { autoComplete: 'family-name', placeholder: 'e.g. Pham' })}
        </FormField>
      </div>

      <div className="field-row">
        <FormField
          id="register-phoneNumber"
          label="Phone number"
          required
          error={errorFor('phoneNumber')}
        >
          {text('phoneNumber', {
            type: 'tel',
            inputMode: 'tel',
            autoComplete: 'tel',
            placeholder: '+84 912 345 678',
          })}
        </FormField>
        <FormField
          id="register-dateOfBirth"
          label="Date of birth"
          required
          error={errorFor('dateOfBirth')}
        >
          <input
            id="register-dateOfBirth"
            type="date"
            autoComplete="bday"
            max={maxDob}
            value={values.dateOfBirth}
            onChange={(e) => setField('dateOfBirth', e.target.value)}
            onBlur={() => markTouched('dateOfBirth')}
            disabled={submitting}
            aria-required="true"
            aria-invalid={errorFor('dateOfBirth') ? true : undefined}
            aria-describedby={fieldDescribedBy('register-dateOfBirth', errorFor('dateOfBirth'))}
          />
        </FormField>
      </div>

      <FormField id="register-email" label="Email" required error={errorFor('email')}>
        {text('email', {
          type: 'email',
          inputMode: 'email',
          autoComplete: 'email',
          placeholder: 'you@example.com',
        })}
      </FormField>

      <div className="field-row">
        <FormField
          id="register-password"
          label="Password"
          required
          error={errorFor('password')}
          hint="At least 8 characters."
        >
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            value={values.password}
            onChange={(value) => setField('password', value)}
            onBlur={() => markTouched('password')}
            disabled={submitting}
            placeholder="At least 8 characters"
            invalid={Boolean(errorFor('password'))}
            describedBy={fieldDescribedBy(
              'register-password',
              errorFor('password'),
              'At least 8 characters.',
            )}
          />
        </FormField>
        <FormField
          id="register-confirmPassword"
          label="Confirm password"
          required
          error={errorFor('confirmPassword')}
        >
          <PasswordInput
            id="register-confirmPassword"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(value) => setField('confirmPassword', value)}
            onBlur={() => markTouched('confirmPassword')}
            disabled={submitting}
            placeholder="Re-enter your password"
            invalid={Boolean(errorFor('confirmPassword'))}
            describedBy={fieldDescribedBy('register-confirmPassword', errorFor('confirmPassword'))}
          />
        </FormField>
      </div>

      {formError ? (
        <p className="form-error" role="alert">
          {formError}
        </p>
      ) : null}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
