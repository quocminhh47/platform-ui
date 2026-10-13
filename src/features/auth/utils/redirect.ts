const FALLBACK = '/';
const PLACEHOLDER_ORIGIN = 'http://internal.invalid';

function hasUnsafeChars(value: string): boolean {
  return [...value].some((char) => char === '\\' || char.charCodeAt(0) < 0x20);
}

/**
 * Reads the intended destination from router state (`{ from }`) and returns it
 * only if it is a same-app path. Anything else falls back to the home route.
 */
export function resolveRedirectTarget(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from;
  if (typeof from !== 'string') {
    return FALLBACK;
  }

  // Must be an absolute path; reject protocol-relative ("//host"), backslash
  // tricks, and control characters.
  if (!from.startsWith('/') || from.startsWith('//') || hasUnsafeChars(from)) {
    return FALLBACK;
  }

  try {
    if (new URL(from, PLACEHOLDER_ORIGIN).origin !== PLACEHOLDER_ORIGIN) {
      return FALLBACK;
    }
  } catch {
    return FALLBACK;
  }

  // Never bounce back to the auth pages themselves.
  if (/^\/(login|register)(\/|\?|#|$)/.test(from)) {
    return FALLBACK;
  }

  return from;
}
