// @vitest-environment node
import { readFileSync } from 'node:fs';
import { validateApiBaseUrl } from './validate-api-base-url';

it.each([undefined, '', '/api', 'javascript:alert(1)', 'https://user:secret@example.com', 'https://api.example.com?secret=x', 'https://api.example.com#x'])('rejects invalid or credentialed API configuration', value => {
  expect(() => validateApiBaseUrl(value)).toThrow();
});
it('normalizes an absolute API URL', () => {
  expect(validateApiBaseUrl(' https://api.example.com/ ')).toBe('https://api.example.com');
});
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const rewrite = new RegExp(`^${config.rewrites[0].source}$`);
it.each(['/articles', '/articles/a-slug', '/articles/edit/123', '/articles/create', '/my-articles', '/admin/articles', '/admin/articles/new', '/admin/articles/123'])('preserves SPA deep link %s', path => {
  expect(rewrite.test(path)).toBe(true);
});
it.each(['/api', '/api/public/articles', '/assets', '/assets/missing.js'])('does not rewrite API or asset path %s', path => {
  expect(rewrite.test(path)).toBe(false);
});
