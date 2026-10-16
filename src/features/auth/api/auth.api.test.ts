import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from './auth.api';

const apiRequest = vi.fn();

vi.mock('../../../services/api/client', () => ({
  apiRequest: (...args: unknown[]) => apiRequest(...args),
}));

describe('auth.api login', () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockResolvedValue({ accessToken: 't', tokenType: 'Bearer', expiresInMs: 1 });
  });

  it('posts identifier and password for email login (with legacy email mirror)', async () => {
    await login({ identifier: 'student@example.com', password: 'password123' });

    expect(apiRequest).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: {
        identifier: 'student@example.com',
        email: 'student@example.com',
        password: 'password123',
      },
    });
  });

  it('posts identifier and password only for phone login', async () => {
    await login({ identifier: '0901234567', password: 'password123' });

    expect(apiRequest).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: {
        identifier: '0901234567',
        password: 'password123',
      },
    });
  });
});
