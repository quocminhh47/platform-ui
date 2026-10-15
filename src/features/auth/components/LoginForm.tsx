import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mapAuthError } from '../validation/server-errors';
import { validateLogin } from '../validation/auth.validation';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
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

    const credentials = { email: email.trim(), password };
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

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />
        {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
        />
        {fieldErrors.password ? (
          <span className="field-error">{fieldErrors.password}</span>
        ) : null}
      </label>

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
