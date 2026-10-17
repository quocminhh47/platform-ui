import { describe, expect, it } from 'vitest';
import { createQuizClockSync, formatCountdownVi, remainingMs } from './quizTimer';

describe('quizTimer', () => {
  it('computes remaining time using server offset', () => {
    const clientNow = 1_000_000;
    const clock = createQuizClockSync(new Date(clientNow + 5_000).toISOString(), clientNow);
    const expiresAt = new Date(clientNow + 65_000).toISOString();
    expect(remainingMs(expiresAt, clock, clientNow)).toBe(60_000);
  });

  it('formats countdown for Vietnamese display', () => {
    expect(formatCountdownVi(125)).toBe('2:05');
    expect(formatCountdownVi(0)).toBe('0:00');
  });
});
