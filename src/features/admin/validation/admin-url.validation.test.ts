import { describe, expect, it } from 'vitest';
import { validateHttpUrl } from './admin-url.validation';

describe('validateHttpUrl', () => {
  it('requires URL when required flag is set', () => {
    expect(validateHttpUrl('  ', true)).toBe('Vui lòng nhập URL.');
    expect(validateHttpUrl('', false)).toBeUndefined();
  });

  it('accepts http and https', () => {
    expect(validateHttpUrl('https://example.com/a', true)).toBeUndefined();
    expect(validateHttpUrl('http://localhost/path', false)).toBeUndefined();
  });

  it('rejects invalid or non-http schemes', () => {
    expect(validateHttpUrl('not-a-url', true)).toBe('URL không hợp lệ.');
    expect(validateHttpUrl('ftp://files.example.com', true)).toBe(
      'URL phải bắt đầu bằng http:// hoặc https://.',
    );
  });
});
