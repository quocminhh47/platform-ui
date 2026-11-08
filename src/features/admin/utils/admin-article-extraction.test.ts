import { describe, expect, it } from 'vitest';
import { adminArticleExtractionStatusLabel } from './admin-article-extraction';

describe('adminArticleExtractionStatusLabel', () => {
  it('maps backend statuses', () => {
    expect(adminArticleExtractionStatusLabel('PENDING')).toBe('Đang trích xuất');
    expect(adminArticleExtractionStatusLabel('SUCCESS')).toBe('Đã trích xuất');
    expect(adminArticleExtractionStatusLabel('FAILED')).toBe('Trích xuất thất bại');
    expect(adminArticleExtractionStatusLabel(null)).toBe('Chưa trích xuất');
  });
});
