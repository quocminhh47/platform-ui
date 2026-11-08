import { useRef, useState, type FormEvent } from 'react';
import { useToast } from '../../../components/feedback/useToast';
import { useAuth } from '../hooks/useAuth';
import { mapAuthError } from '../validation/server-errors';
import { validateLogin } from '../validation/auth.validation';
import { FormField } from './FormField';
import { fieldDescribedBy } from './fieldDescribedBy';
import { UI_COPY } from '../../../ui/ui-copy';
import { PasswordInput } from './PasswordInput';

const LOGIN_SUCCESS_MESSAGE = 'Đăng nhập thành công';

export function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();
  const loginToastShownRef = useRef(false);
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
      if (!loginToastShownRef.current) {
        loginToastShownRef.current = true;
        toast.success(LOGIN_SUCCESS_MESSAGE, { dedupeKey: 'login-success' });
      }
    } catch (error) {
      loginToastShownRef.current = false;
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
        label="Email hoặc số điện thoại"
        required
        error={fieldErrors.identifier ?? fieldErrors.email}
      >
        <input
          id="login-identifier"
          type="text"
          autoComplete="username"
          placeholder="Nhập email hoặc số điện thoại"
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

      <FormField id="login-password" label="Mật khẩu" required error={fieldErrors.password}>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            clearError('password');
          }}
          disabled={submitting}
          placeholder="Mật khẩu"
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
        {submitting ? UI_COPY.signingIn : UI_COPY.signIn}
      </button>
    </form>
  );
}
