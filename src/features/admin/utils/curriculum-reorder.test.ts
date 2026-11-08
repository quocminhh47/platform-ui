import { describe, expect, it } from 'vitest';
import { moveItemByOffset, orderedIds } from './curriculum-reorder';

describe('curriculum-reorder', () => {
  it('moveItemByOffset moves an item down', () => {
    expect(moveItemByOffset(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('moveItemByOffset is a no-op for invalid indices', () => {
    expect(moveItemByOffset(['a'], 0, 2)).toEqual(['a']);
  });

  it('orderedIds maps ids', () => {
    expect(orderedIds([{ id: 'x', sortOrder: 1 }, { id: 'y', sortOrder: 2 }])).toEqual(['x', 'y']);
  });
});
