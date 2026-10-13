/**
 * Access-token storage for the SPA session.
 * Stores only the JWT access token — never passwords or the JWT signing secret.
 * sessionStorage is cleared when the tab closes.
 */
const ACCESS_TOKEN_KEY = 'lms.accessToken';

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}
