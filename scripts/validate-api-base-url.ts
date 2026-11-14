/** Validate the public API origin without ever echoing a possibly credentialed value. */
export function validateApiBaseUrl(value: string | undefined): string {
  const message = 'VITE_API_BASE_URL must be an absolute HTTP(S) URL without credentials, query, or fragment.';
  if (!value?.trim()) throw new Error('VITE_API_BASE_URL is required for production builds. Set it in Vercel Environment Variables.');
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(message);
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error(message);
  }
  return value.trim().replace(/\/+$/, '');
}
