import { describe, expect, it } from 'vitest';
import { canStartAnotherAttempt, formatAttemptsQuotaVi } from './quizAttemptQuota';

describe('quizAttemptQuota', () => {
  it('allows another attempt when unlimited', () => {
    expect(canStartAnotherAttempt(5, null)).toBe(true);
    expect(canStartAnotherAttempt(5, undefined)).toBe(true);
  });

  it('blocks when attemptsUsed reaches maxAttempts', () => {
    expect(canStartAnotherAttempt(2, 2)).toBe(false);
    expect(canStartAnotherAttempt(1, 2)).toBe(true);
  });

  it('formats quota label', () => {
    expect(formatAttemptsQuotaVi(1, 2)).toBe('Lượt đã dùng: 1/2');
    expect(formatAttemptsQuotaVi(3, null)).toBe('Lượt đã dùng: 3');
  });
});
