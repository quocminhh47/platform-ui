import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as authApi from '../../features/auth/api/auth.api';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { User } from '../../features/auth/types/auth.types';
import { ApiError } from '../../services/api/api-error';
import { getAccessToken, setAccessToken } from '../../services/api/token-storage';
import { AuthProvider } from './AuthProvider';

vi.mock('../../features/auth/api/auth.api', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

const api = vi.mocked(authApi);

function makeUser(email: string): User {
  return {
    id: `id-${email}`,
    email,
    fullName: 'Test User',
    role: 'STUDENT',
    avatarUrl: null,
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

let lastLoginError: unknown = null;

function Probe() {
  const auth = useAuth();
  const state = auth.isInitializing
    ? 'initializing'
    : auth.isAuthenticated
      ? `user:${auth.user?.email}`
      : 'guest';

  return (
    <div>
      <span data-testid="state">{state}</span>
      <button
        type="button"
        onClick={() => {
          auth
            .login({ identifier: 'new@example.com', password: 'password123' })
            .catch((error: unknown) => {
              lastLoginError = error;
            });
        }}
      >
        login
      </button>
      <button type="button" onClick={auth.logout}>
        logout
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

const state = () => screen.getByTestId('state').textContent;

beforeEach(() => {
  sessionStorage.clear();
  lastLoginError = null;
  api.fetchCurrentUser.mockReset();
  api.login.mockReset();
  api.register.mockReset();
});

describe('AuthProvider session initialization', () => {
  it('restores the user from a stored token', async () => {
    setAccessToken('stored-token');
    api.fetchCurrentUser.mockResolvedValue(makeUser('a@example.com'));

    renderProvider();
    expect(state()).toBe('initializing');

    await waitFor(() => expect(state()).toBe('user:a@example.com'));
    expect(api.fetchCurrentUser).toHaveBeenCalledTimes(1);
    expect(api.fetchCurrentUser).toHaveBeenCalledWith('stored-token');
  });

  it('does not call /me when no token is stored', () => {
    renderProvider();

    expect(state()).toBe('guest');
    expect(api.fetchCurrentUser).not.toHaveBeenCalled();
  });

  it('clears an invalid or expired token (401)', async () => {
    setAccessToken('expired-token');
    api.fetchCurrentUser.mockRejectedValue(new ApiError(401, 'Authentication required'));

    renderProvider();

    await waitFor(() => expect(state()).toBe('guest'));
    expect(getAccessToken()).toBeNull();
  });

  it('keeps the stored token on a network failure and logs the error', async () => {
    setAccessToken('stored-token');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    api.fetchCurrentUser.mockRejectedValue(new TypeError('Failed to fetch'));

    renderProvider();

    await waitFor(() => expect(state()).toBe('guest'));
    expect(getAccessToken()).toBe('stored-token');
    expect(consoleError).toHaveBeenCalled();
  });
});

describe('AuthProvider session establishment', () => {
  it('rolls back token and user when /me fails after login', async () => {
    api.login.mockResolvedValue({
      accessToken: 'new-token',
      tokenType: 'Bearer',
      expiresInMs: 1000,
    });
    api.fetchCurrentUser.mockRejectedValue(new ApiError(500, 'boom'));

    renderProvider();
    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(lastLoginError).toBeInstanceOf(ApiError));
    expect(state()).toBe('guest');
    expect(getAccessToken()).toBeNull();
  });

  it('stores the token only after /me succeeds', async () => {
    const me = deferred<User>();
    api.login.mockResolvedValue({
      accessToken: 'new-token',
      tokenType: 'Bearer',
      expiresInMs: 1000,
    });
    api.fetchCurrentUser.mockReturnValue(me.promise);

    renderProvider();
    fireEvent.click(screen.getByText('login'));
    await waitFor(() => expect(api.fetchCurrentUser).toHaveBeenCalledWith('new-token'));
    expect(getAccessToken()).toBeNull();

    await act(async () => {
      me.resolve(makeUser('new@example.com'));
    });

    expect(state()).toBe('user:new@example.com');
    expect(getAccessToken()).toBe('new-token');
  });
});

describe('AuthProvider stale responses', () => {
  it('ignores a stale /me response after logout', async () => {
    setAccessToken('stored-token');
    const me = deferred<User>();
    api.fetchCurrentUser.mockReturnValue(me.promise);

    renderProvider();
    expect(state()).toBe('initializing');

    fireEvent.click(screen.getByText('logout'));
    expect(state()).toBe('guest');

    await act(async () => {
      me.resolve(makeUser('stale@example.com'));
    });

    expect(state()).toBe('guest');
    expect(getAccessToken()).toBeNull();
  });

  it('does not let a stale restore overwrite a newer login', async () => {
    setAccessToken('old-token');
    const staleMe = deferred<User>();
    api.fetchCurrentUser
      .mockReturnValueOnce(staleMe.promise)
      .mockResolvedValue(makeUser('new@example.com'));
    api.login.mockResolvedValue({
      accessToken: 'new-token',
      tokenType: 'Bearer',
      expiresInMs: 1000,
    });

    renderProvider();
    fireEvent.click(screen.getByText('login'));
    await waitFor(() => expect(state()).toBe('user:new@example.com'));

    await act(async () => {
      staleMe.resolve(makeUser('old@example.com'));
    });

    expect(state()).toBe('user:new@example.com');
    expect(getAccessToken()).toBe('new-token');
  });

  it('ignores a login that completes after logout', async () => {
    const loginResponse = deferred<{
      accessToken: string;
      tokenType: string;
      expiresInMs: number;
    }>();
    api.login.mockReturnValue(loginResponse.promise);
    api.fetchCurrentUser.mockResolvedValue(makeUser('late@example.com'));

    renderProvider();
    fireEvent.click(screen.getByText('login'));
    fireEvent.click(screen.getByText('logout'));

    await act(async () => {
      loginResponse.resolve({ accessToken: 'late-token', tokenType: 'Bearer', expiresInMs: 1000 });
    });

    expect(state()).toBe('guest');
    expect(getAccessToken()).toBeNull();
    expect(api.fetchCurrentUser).not.toHaveBeenCalled();
  });
});
