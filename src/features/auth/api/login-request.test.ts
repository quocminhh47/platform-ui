import { describe, expect, it } from 'vitest';
import { buildLoginRequestBody } from './login-request';

describe('buildLoginRequestBody', () => {
  it('sends identifier and password for email login and mirrors email for legacy APIs', () => {
    const body = buildLoginRequestBody({
      identifier: '  student@example.com ',
      password: 'secret',
    });
    expect(body).toEqual({
      identifier: 'student@example.com',
      email: 'student@example.com',
      password: 'secret',
    });
  });

  it('sends identifier and password only for phone login', () => {
    const body = buildLoginRequestBody({
      identifier: '+84 912 345 678',
      password: 'secret',
    });
    expect(body).toEqual({
      identifier: '+84 912 345 678',
      password: 'secret',
    });
    expect('email' in body).toBe(false);
  });

  it('never includes a blank email field', () => {
    const body = buildLoginRequestBody({ identifier: '0901234567', password: 'x' });
    expect(body.email).toBeUndefined();
  });
});
