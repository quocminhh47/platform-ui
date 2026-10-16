import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mapAuthError } from '../validation/server-errors';
import { validateLogin } from '../validation/auth.validation';
import { FormField } from './FormField';
import { fieldDescribedBy } from './fieldDescribedBy';
import { PasswordInput } from './PasswordInput';

export function LoginForm() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setFormError(null);

    const credentials = { identifier: identifier.trim(), password };
    const errors = validateLogin(credentials);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await login(credentials);
    } catch (error) {
      const mapped = mapAuthError(error, 'login');
      setFieldErrors(mapped.fields);
      setFormError(mapped.form);
    } finally {
      setSubmitting(false);
    }
  }

  function clearError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <FormField
        id="login-identifier"
        label="Email or phone number"
        required
        error={fieldErrors.identifier ?? fieldErrors.email}
      >
        <input
          id="login-identifier"
          type="text"
          autoComplete="username"
          placeholder="Enter your email or phone number"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            clearError('identifier');
          }}
          disabled={submitting}
          aria-required="true"
          aria-invalid={fieldErrors.identifier ? true : undefined}
          aria-describedby={fieldDescribedBy('login-identifier', fieldErrors.identifier)}
        />
      </FormField>

      <FormField id="login-password" label="Password" required error={fieldErrors.password}>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            clearError('password');
          }}
          disabled={submitting}
          placeholder="Password"
          invalid={Boolean(fieldErrors.password)}
          describedBy={fieldDescribedBy('login-password', fieldErrors.password)}
        />
      </FormField>

      {formError ? (
        <p className="form-error" role="alert">
          {formError}
        </p>
      ) : null}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
