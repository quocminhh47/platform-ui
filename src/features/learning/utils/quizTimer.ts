/** Client/server clock skew captured when the take payload was received. */
export type QuizClockSync = {
  serverOffsetMs: number;
};

export function createQuizClockSync(serverNowIso: string, clientNowMs = Date.now()): QuizClockSync {
  const serverMs = Date.parse(serverNowIso);
  return {
    serverOffsetMs: Number.isNaN(serverMs) ? 0 : serverMs - clientNowMs,
  };
}

export function remainingMs(
  expiresAtIso: string,
  clock: QuizClockSync,
  clientNowMs = Date.now(),
): number {
  const expiresMs = Date.parse(expiresAtIso);
  if (Number.isNaN(expiresMs)) {
    return 0;
  }
  const serverNowMs = clientNowMs + clock.serverOffsetMs;
  return expiresMs - serverNowMs;
}

export function formatCountdownVi(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
