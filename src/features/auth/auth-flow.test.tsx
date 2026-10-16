import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter, type InitialEntry } from 'react-router-dom';
import { AuthProvider } from '../../app/providers/AuthProvider';
import { ApiError } from '../../services/api/api-error';
import * as authApi from './api/auth.api';
import { GuestRoute } from './components/GuestRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import type { User } from './types/auth.types';
import { latestDateOfBirth } from './validation/auth.validation';
import { mapAuthError } from './validation/server-errors';
import { resolveRedirectTarget } from './utils/redirect';

vi.mock('./api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

const api = vi.mocked(authApi);

const user: User = {
  id: 'u1',
  email: 'student@example.com',
  fullName: 'Student',
  firstName: null,
  lastName: null,
  phone: null,
  dateOfBirth: null,
  role: 'STUDENT',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderApp(initialEntry: InitialEntry) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <p>Home page</p> },
      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [{ path: 'account', element: <p>Account page</p> }],
      },
    ],
    { initialEntries: [initialEntry] },
  );
  render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  );
  return router;
}

function fillLogin(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/^Email or phone number/), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

function fillRegister(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    'First name': 'Minh',
    'Last name': 'Pham',
    'Phone number': '+84 912 345 678',
    'Date of birth': '2000-01-15',
    Email: 'student@example.com',
    Password: 'password123',
    'Confirm password': 'password123',
    ...overrides,
  };
  for (const [label, value] of Object.entries(values)) {
    fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value } });
  }
}

beforeEach(() => {
  sessionStorage.clear();
  api.fetchCurrentUser.mockReset();
  api.login.mockReset();
  api.register.mockReset();
});

describe('route protection and login redirect', () => {
  it('redirects an unauthenticated visitor to login and keeps the destination', async () => {
    const router = renderApp('/account?tab=progress');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({ from: '/account?tab=progress' });
  });

  it('navigates to the intended destination after a successful login', async () => {
    api.login.mockResolvedValue({ accessToken: 't', tokenType: 'Bearer', expiresInMs: 1 });
    api.fetchCurrentUser.mockResolvedValue(user);
    const router = renderApp('/account?tab=progress');

    await screen.findByRole('heading', { name: 'Sign in' });
    fillLogin('student@example.com', 'password123');

    expect(await screen.findByText('Account page')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/account');
    expect(router.state.location.search).toBe('?tab=progress');
  });

  it('falls back to home when there is no destination', async () => {
    api.login.mockResolvedValue({ accessToken: 't', tokenType: 'Bearer', expiresInMs: 1 });
    api.fetchCurrentUser.mockResolvedValue(user);
    renderApp('/login');

    fillLogin('student@example.com', 'password123');

    expect(await screen.findByText('Home page')).toBeTruthy();
  });

  it('ignores an external redirect target', async () => {
    api.login.mockResolvedValue({ accessToken: 't', tokenType: 'Bearer', expiresInMs: 1 });
    api.fetchCurrentUser.mockResolvedValue(user);
    const router = renderApp({ pathname: '/login', state: { from: '//evil.example/phish' } });

    fillLogin('student@example.com', 'password123');

    expect(await screen.findByText('Home page')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/');
  });

  it('keeps the destination when switching to the register page', async () => {
    const router = renderApp('/account');

    await screen.findByRole('heading', { name: 'Sign in' });
    fireEvent.click(screen.getByRole('link', { name: 'Register' }));

    expect(await screen.findByRole('heading', { name: 'Create account' })).toBeTruthy();
    expect(router.state.location.state).toEqual({ from: '/account' });
  });
});

describe('server validation errors in forms', () => {
  it('shows an invalid-credentials message on login 401', async () => {
    api.login.mockRejectedValue(new ApiError(401, 'Invalid email or password'));
    renderApp('/login');

    fillLogin('student@example.com', 'wrong-password');

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Invalid email/phone number or password.');
  });

  it('shows field messages from 400 details on register', async () => {
    api.register.mockRejectedValue(
      new ApiError(400, 'Validation failed', {
        status: 400,
        message: 'Validation failed',
        details: ['password: size must be between 8 and 100', 'email: must be a well-formed email address'],
      }),
    );
    renderApp('/register');

    fillRegister();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(screen.getByText('size must be between 8 and 100')).toBeTruthy(),
    );
    expect(screen.getByText('must be a well-formed email address')).toBeTruthy();
  });

  it('shows an email conflict on register 409', async () => {
    api.register.mockRejectedValue(new ApiError(409, 'Email already registered'));
    renderApp('/register');

    fillRegister();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('An account with this email already exists.')).toBeTruthy();
  });

  it('does not expose raw server errors for unexpected failures', () => {
    expect(mapAuthError(new ApiError(500, 'org.postgresql.util.PSQLException: secret'), 'login'))
      .toEqual({ form: 'Something went wrong. Please try again later.', fields: {} });
    expect(mapAuthError(new TypeError('Failed to fetch'), 'login').form).toMatch(/reach the server/);
  });
});

describe('register form validation', () => {
  it('shows field-specific errors and does not call the API for invalid input', async () => {
    renderApp('/register');

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('First name is required')).toBeTruthy();
    expect(screen.getByText('Last name is required')).toBeTruthy();
    expect(screen.getByText('Phone number is required')).toBeTruthy();
    expect(screen.getByText('Date of birth is required')).toBeTruthy();
    expect(screen.getByText('Email is required')).toBeTruthy();
    expect(screen.getByText('Password is required')).toBeTruthy();
    expect(api.register).not.toHaveBeenCalled();
  });

  it('shows immediate feedback on blur and for mismatched passwords', () => {
    renderApp('/register');

    const phone = screen.getByLabelText(/^Phone number/);
    fireEvent.change(phone, { target: { value: 'abc' } });
    fireEvent.blur(phone);
    expect(screen.getByText(/Enter a valid phone number/)).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: 'password123' } });
    const confirm = screen.getByLabelText(/^Confirm password/);
    fireEvent.change(confirm, { target: { value: 'different' } });
    fireEvent.blur(confirm);
    expect(screen.getByText('Passwords do not match')).toBeTruthy();
  });

  it('prevents selecting a future date of birth', () => {
    renderApp('/register');
    const dob = screen.getByLabelText(/^Date of birth/) as HTMLInputElement;
    expect(dob.max).toBe(latestDateOfBirth());
  });

  it('sends trimmed values and never sends confirmPassword', async () => {
    api.register.mockResolvedValue({ accessToken: 't', tokenType: 'Bearer', expiresInMs: 1 });
    api.fetchCurrentUser.mockResolvedValue(user);
    renderApp('/register');

    fillRegister({ 'First name': '  Minh ', Email: ' student@example.com ' });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(api.register).toHaveBeenCalledTimes(1));
    expect(api.register).toHaveBeenCalledWith({
      firstName: 'Minh',
      lastName: 'Pham',
      phoneNumber: '+84 912 345 678',
      dateOfBirth: '2000-01-15',
      email: 'student@example.com',
      password: 'password123',
    });
  });

  it('maps backend field errors and duplicate phone conflicts onto fields', async () => {
    api.register.mockRejectedValueOnce(
      new ApiError(409, 'Phone number already registered', {
        status: 409,
        message: 'Phone number already registered',
        details: ['phoneNumber: Phone number already registered'],
      }),
    );
    renderApp('/register');

    fillRegister();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText('An account with this phone number already exists.'),
    ).toBeTruthy();
    expect(screen.queryByText('An account with this email already exists.')).toBeNull();
  });

  it('maps firstName and dateOfBirth validation details from a 400', () => {
    const mapped = mapAuthError(
      new ApiError(400, 'Validation failed', {
        status: 400,
        message: 'Validation failed',
        details: ['firstName: must not be blank', 'dateOfBirth: must be a past date'],
      }),
      'register',
    );
    expect(mapped.fields).toEqual({
      firstName: 'must not be blank',
      dateOfBirth: 'must be a past date',
    });
  });
});

describe('login identifier', () => {
  it('accepts a phone number and submits it as the identifier', async () => {
    api.login.mockResolvedValue({ accessToken: 't', tokenType: 'Bearer', expiresInMs: 1 });
    api.fetchCurrentUser.mockResolvedValue(user);
    renderApp('/login');

    fillLogin('  +84 912 345 678 ', 'password123');

    await waitFor(() =>
      expect(api.login).toHaveBeenCalledWith({
        identifier: '+84 912 345 678',
        password: 'password123',
      }),
    );
  });

  it('submits trimmed email credentials to the auth layer', async () => {
    api.login.mockResolvedValue({ accessToken: 't', tokenType: 'Bearer', expiresInMs: 1 });
    api.fetchCurrentUser.mockResolvedValue(user);
    renderApp('/login');

    fillLogin('  student@example.com  ', 'password123');

    await waitFor(() =>
      expect(api.login).toHaveBeenCalledWith({
        identifier: 'student@example.com',
        password: 'password123',
      }),
    );
  });

  it('rejects an identifier that is neither an email nor a phone number', () => {
    renderApp('/login');

    fillLogin('not valid', 'password123');

    expect(screen.getByText('Enter a valid email address or phone number')).toBeTruthy();
    expect(api.login).not.toHaveBeenCalled();
  });

  it('does not render the removed template attribution', () => {
    renderApp('/login');
    expect(document.body.textContent).not.toMatch(/Một sản phẩm của/);
    expect(document.body.textContent).not.toMatch(/BÁCH KHOA/i);
  });
});

describe('resolveRedirectTarget', () => {
  it.each([
    [{ from: '/account?tab=1#top' }, '/account?tab=1#top'],
    [{ from: '/courses/42' }, '/courses/42'],
    [undefined, '/'],
    [null, '/'],
    [{ from: 42 }, '/'],
    [{ from: 'https://evil.example' }, '/'],
    [{ from: '//evil.example' }, '/'],
    [{ from: '/\\evil.example' }, '/'],
    [{ from: 'javascript:alert(1)' }, '/'],
    [{ from: '/login' }, '/'],
    [{ from: '/register?x=1' }, '/'],
  ])('resolves %j to %s', (state, expected) => {
    expect(resolveRedirectTarget(state)).toBe(expected);
  });
});
