import type { PageResponse } from '../types/pagination.types';

export function mockPage<T>(
  content: T[],
  overrides: Partial<PageResponse<T>> = {},
): PageResponse<T> {
  return {
    content,
    page: 0,
    size: content.length || 20,
    totalElements: content.length,
    totalPages: content.length > 0 ? 1 : 0,
    first: true,
    last: true,
    ...overrides,
  };
}
