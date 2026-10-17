/** Mirrors backend quota check for starting a new attempt (not resume). */
export function canStartAnotherAttempt(
  attemptsUsed: number,
  maxAttempts: number | null | undefined,
): boolean {
  if (maxAttempts == null) {
    return true;
  }
  return attemptsUsed < maxAttempts;
}

export function formatAttemptsQuotaVi(
  attemptsUsed: number,
  maxAttempts: number | null | undefined,
): string {
  if (maxAttempts == null) {
    return `Lượt đã dùng: ${attemptsUsed}`;
  }
  return `Lượt đã dùng: ${attemptsUsed}/${maxAttempts}`;
}
