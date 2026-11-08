/** Client-side http(s) URL check aligned with browser URL inputs. */
export function validateHttpUrl(value: string, required: boolean): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return required ? 'Vui lòng nhập URL.' : undefined;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'URL phải bắt đầu bằng http:// hoặc https://.';
    }
  } catch {
    return 'URL không hợp lệ.';
  }
  return undefined;
}
