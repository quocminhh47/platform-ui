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
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
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
    expect(alert.textContent).toBe('Invalid email or password.');
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

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Student' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'student@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(screen.getByText('size must be between 8 and 100')).toBeTruthy(),
    );
    expect(screen.getByText('must be a well-formed email address')).toBeTruthy();
  });

  it('shows an email conflict on register 409', async () => {
    api.register.mockRejectedValue(new ApiError(409, 'Email already registered'));
    renderApp('/register');

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Student' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'student@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('An account with this email already exists.')).toBeTruthy();
  });

  it('does not expose raw server errors for unexpected failures', () => {
    expect(mapAuthError(new ApiError(500, 'org.postgresql.util.PSQLException: secret'), 'login'))
      .toEqual({ form: 'Something went wrong. Please try again later.', fields: {} });
    expect(mapAuthError(new TypeError('Failed to fetch'), 'login').form).toMatch(/reach the server/);
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
