import type { LoginCredentials } from '../types/auth.types';

/**
 * POST /api/auth/login body. Always sends `identifier` + `password`.
 * When the identifier is an email, also sends `email` with the same value so
 * legacy backends (email-only LoginRequest) still deserialize credentials.
 * Phone logins send only `identifier` (requires the current identifier-based API).
 */
export function buildLoginRequestBody(
  credentials: LoginCredentials,
): Record<string, string> {
  const identifier = credentials.identifier.trim();
  const body: Record<string, string> = {
    identifier,
    password: credentials.password,
  };
  if (identifier.includes('@')) {
    body.email = identifier;
  }
  return body;
}
