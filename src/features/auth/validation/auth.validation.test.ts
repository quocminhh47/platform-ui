import { latestDateOfBirth, validateLogin, validateRegister, type RegisterValues } from './auth.validation';

const valid: RegisterValues = {
  firstName: 'Minh',
  lastName: 'Pham',
  phoneNumber: '+84 912 345 678',
  dateOfBirth: '2000-01-15',
  email: 'minh@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

const now = new Date(2026, 9, 16);

describe('validateRegister', () => {
  it('accepts a valid form', () => {
    expect(validateRegister(valid, now)).toEqual({});
  });

  it('rejects blank and over-long names', () => {
    const errors = validateRegister({ ...valid, firstName: '   ', lastName: 'x'.repeat(101) }, now);
    expect(errors.firstName).toBeDefined();
    expect(errors.lastName).toBeDefined();
  });

  it('accepts international phone formats but rejects bad ones', () => {
    for (const phone of ['0901234567', '+1 (415) 555-2671', '+44 20 7946 0958', '090-123-4567']) {
      expect(validateRegister({ ...valid, phoneNumber: phone }, now).phoneNumber).toBeUndefined();
    }
    for (const phone of ['abc', '1234567', '+1234567890123456', '12+345678901']) {
      expect(validateRegister({ ...valid, phoneNumber: phone }, now).phoneNumber).toBeDefined();
    }
  });

  it('rejects today, future and impossible dates of birth', () => {
    expect(validateRegister({ ...valid, dateOfBirth: '2026-10-16' }, now).dateOfBirth).toBeDefined();
    expect(validateRegister({ ...valid, dateOfBirth: '2027-01-01' }, now).dateOfBirth).toBeDefined();
    expect(validateRegister({ ...valid, dateOfBirth: '2001-02-30' }, now).dateOfBirth).toBeDefined();
    expect(validateRegister({ ...valid, dateOfBirth: '2026-10-15' }, now).dateOfBirth).toBeUndefined();
    expect(latestDateOfBirth(now)).toBe('2026-10-15');
  });

  it('applies the backend password policy (8-100 chars) and confirmation', () => {
    expect(validateRegister({ ...valid, password: 'short', confirmPassword: 'short' }, now).password).toBeDefined();
    expect(validateRegister({ ...valid, password: 'x'.repeat(101), confirmPassword: 'x'.repeat(101) }, now).password).toBeDefined();
    expect(validateRegister({ ...valid, confirmPassword: 'nope' }, now).confirmPassword).toBe('Passwords do not match');
  });
});

describe('validateLogin', () => {
  it('accepts email or phone identifiers', () => {
    expect(validateLogin({ identifier: 'a@b.co', password: 'x' })).toEqual({});
    expect(validateLogin({ identifier: '0901234567', password: 'x' })).toEqual({});
  });

  it('rejects empty and malformed identifiers', () => {
    expect(validateLogin({ identifier: '', password: 'x' }).identifier).toBeDefined();
    expect(validateLogin({ identifier: 'a@b', password: 'x' }).identifier).toBeDefined();
    expect(validateLogin({ identifier: 'hello', password: 'x' }).identifier).toBeDefined();
    expect(validateLogin({ identifier: 'a@b.co', password: '' }).password).toBeDefined();
  });
});
