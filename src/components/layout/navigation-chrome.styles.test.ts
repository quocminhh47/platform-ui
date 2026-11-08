import { describe, expect, it } from 'vitest';
import adminStyles from '../../styles/admin-course-management.css?raw';
import indexStyles from '../../styles/index.css?raw';
import landingStyles from '../../styles/landing.css?raw';

function ruleIncludes(source: string, selector: string, property: string, value: string): boolean {
  const pattern = new RegExp(
    `${selector.replace('.', '\\.')}\\s*\\{[\\s\\S]*?${property}\\s*:\\s*${value}[\\s\\S]*?\\}`,
    'm',
  );
  return pattern.test(source);
}

describe('navigation chrome CSS', () => {
  it('prevents wrapping on public header account and main nav links', () => {
    expect(ruleIncludes(landingStyles, '.site-header-link', 'white-space', 'nowrap')).toBe(true);
    expect(ruleIncludes(landingStyles, '.site-header-nav-link', 'white-space', 'nowrap')).toBe(true);
    expect(ruleIncludes(landingStyles, '.site-header-login', 'white-space', 'nowrap')).toBe(true);
    expect(ruleIncludes(landingStyles, '.site-header-sign-out', 'white-space', 'nowrap')).toBe(true);
  });

  it('prevents flex shrink from wrapping dashboard and admin sidebar labels', () => {
    expect(ruleIncludes(indexStyles, '.sidebar-nav a', 'white-space', 'nowrap')).toBe(true);
    expect(ruleIncludes(adminStyles, '.admin-sidebar-courses-link', 'white-space', 'nowrap')).toBe(true);
  });

  it('uses a flex column shell so the footer sits at the viewport bottom on short pages', () => {
    expect(ruleIncludes(landingStyles, '.public-layout', 'min-height', '100vh')).toBe(true);
    expect(ruleIncludes(landingStyles, '.public-layout', 'flex-direction', 'column')).toBe(true);
    expect(ruleIncludes(landingStyles, '.public-main', 'flex', '1 1 auto')).toBe(true);
    expect(ruleIncludes(indexStyles, '#root', 'min-height', '100vh')).toBe(true);
  });
});
