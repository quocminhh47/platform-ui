/** Formats API `durationSeconds` when present. */
export function formatDuration(durationSeconds: number | null): string | null {
  if (durationSeconds === null || !Number.isFinite(durationSeconds) || durationSeconds < 0) {
    return null;
  }
  const minutes = Math.round(durationSeconds / 60);
  if (minutes < 1) {
    return '< 1 min';
  }
  return `${minutes} min`;
}
