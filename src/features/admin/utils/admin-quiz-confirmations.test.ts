import { describe, expect, it, vi } from 'vitest';
import {
  confirmRemoveQuizOption,
  confirmRemoveQuizQuestion,
} from './admin-quiz-confirmations';

describe('admin quiz confirmations', () => {
  it('asks before removing a question', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    expect(confirmRemoveQuizQuestion(2)).toBe(true);
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('Xóa câu 2'));
  });

  it('asks before removing an option', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    expect(confirmRemoveQuizOption('B')).toBe(false);
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('lựa chọn B'));
  });
});
