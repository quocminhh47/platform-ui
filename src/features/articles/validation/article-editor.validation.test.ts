import { describe, expect, it } from 'vitest';
import {
  buildArticleWriteBody,
  hasMeaningfulHtmlContent,
  validateArticleEditor,
  validateFeaturedImageUrl,
} from './article-editor.validation';

describe('article-editor.validation', () => {
  it('detects meaningful html text', () => {
    expect(hasMeaningfulHtmlContent('<p></p>')).toBe(false);
    expect(hasMeaningfulHtmlContent('<p>Hello</p>')).toBe(true);
  });

  it('rejects blank title and empty content', () => {
    const result = validateArticleEditor(
      { title: '  ', excerpt: '', featuredImageUrl: '', contentHtml: '<p></p>' },
      { requireRichContent: true },
    );
    expect(result.fieldErrors.title).toBeTruthy();
    expect(result.fieldErrors.contentHtml).toBeTruthy();
  });

  it('validates featured image url protocol', () => {
    expect(validateFeaturedImageUrl('javascript:alert(1)')).toMatch(/http/);
    expect(validateFeaturedImageUrl('https://cdn.example.com/x.jpg')).toBeNull();
  });

  it('builds write body with null optional fields', () => {
    const body = buildArticleWriteBody({
      title: ' Title ',
      excerpt: '  ',
      featuredImageUrl: '',
      contentHtml: '<p>Body</p>',
    });
    expect(body.title).toBe('Title');
    expect(body.excerpt).toBeNull();
    expect(body.featuredImageUrl).toBeNull();
  });
});
