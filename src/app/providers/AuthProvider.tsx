import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../../features/auth/api/auth.api';
import { AuthContext } from '../../features/auth/hooks/AuthContext';
import type {
  LoginCredentials,
  RegisterPayload,
  User,
} from '../../features/auth/types/auth.types';
import { ApiError } from '../../services/api/api-error';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../../services/api/token-storage';

type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Owns session initialization once for the whole app.
 * Protected pages must not fetch /me independently.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setTokenState] = useState<string | null>(() => getAccessToken());
  const [isInitializing, setIsInitializing] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    let cancelled = false;
    const token = getAccessToken();

    if (!token) {
      return;
    }

    authApi
      .fetchCurrentUser(token)
      .then((profile) => {
        if (!cancelled) {
          setUser(profile);
          setTokenState(token);
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        clearAccessToken();
        setTokenState(null);
        setUser(null);
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error('Failed to restore session', error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsInitializing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const establishSession = useCallback(async (token: string) => {
    setAccessToken(token);
    setTokenState(token);
    const profile = await authApi.fetchCurrentUser(token);
    setUser(profile);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const tokens = await authApi.login(credentials);
      await establishSession(tokens.accessToken);
    },
    [establishSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const tokens = await authApi.register(payload);
      await establishSession(tokens.accessToken);
    },
    [establishSession],
  );

  const logout = useCallback(() => {
    clearAccessToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isInitializing,
      login,
      register,
      logout,
    }),
    [user, accessToken, isInitializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
