import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
 *
 * Every session-changing operation (restore, login, register, logout) takes a
 * generation number from `generation`. Only the operation that still holds the
 * latest generation may write state, so a slow older response can never
 * overwrite a newer session or resurrect a user after logout.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const generation = useRef(0);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setTokenState] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(() => Boolean(getAccessToken()));

  /** Starts a new session epoch; supersedes any in-flight operation. */
  const beginSession = useCallback(() => {
    generation.current += 1;
    // A newer operation owns the session now; never leave the app "initializing".
    setIsInitializing(false);
    return generation.current;
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    generation.current += 1;
    const gen = generation.current;

    authApi
      .fetchCurrentUser(token)
      .then((profile) => {
        if (gen !== generation.current) {
          return;
        }
        setUser(profile);
        setTokenState(token);
      })
      .catch((error: unknown) => {
        if (gen !== generation.current) {
          return;
        }
        setUser(null);
        setTokenState(null);
        if (error instanceof ApiError && error.status === 401) {
          // Invalid or expired token: it can never work again.
          clearAccessToken();
        } else {
          // Network/server failure: keep the stored token so a reload can retry.
          console.error('Failed to restore session', error);
        }
      })
      .finally(() => {
        if (gen === generation.current) {
          setIsInitializing(false);
        }
      });
  }, []);

  /**
   * Verifies the token with /me first and only then persists it, so a failed
   * /me never leaves a token or user behind. Stale calls are ignored.
   */
  const establishSession = useCallback(async (token: string, gen: number) => {
    const profile = await authApi.fetchCurrentUser(token);
    if (gen !== generation.current) {
      return;
    }
    setAccessToken(token);
    setTokenState(token);
    setUser(profile);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const gen = beginSession();
      const tokens = await authApi.login(credentials);
      if (gen !== generation.current) {
        return;
      }
      await establishSession(tokens.accessToken, gen);
    },
    [beginSession, establishSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const gen = beginSession();
      const tokens = await authApi.register(payload);
      if (gen !== generation.current) {
        return;
      }
      await establishSession(tokens.accessToken, gen);
    },
    [beginSession, establishSession],
  );

  const logout = useCallback(() => {
    beginSession();
    clearAccessToken();
    setTokenState(null);
    setUser(null);
  }, [beginSession]);

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
