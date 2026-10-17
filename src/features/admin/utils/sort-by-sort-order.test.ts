import { describe, expect, it } from 'vitest';
import { sortBySortOrder } from './sort-by-sort-order';

describe('sortBySortOrder', () => {
  it('orders items by sortOrder ascending', () => {
    const items = [
      { id: 'b', sortOrder: 2 },
      { id: 'a', sortOrder: 0 },
      { id: 'c', sortOrder: 1 },
    ];
    expect(sortBySortOrder(items).map((item) => item.id)).toEqual(['a', 'c', 'b']);
  });
});
