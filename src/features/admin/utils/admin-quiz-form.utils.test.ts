import { describe, expect, it } from 'vitest';
import {
  applyQuestionTypeChange,
  duplicateQuestion,
  optionDisplayLabel,
  reorderQuestions,
  setSingleCorrectOption,
} from './admin-quiz-form.utils';
import { emptyQuestion } from '../validation/admin-quiz-form.validation';

describe('admin-quiz-form.utils', () => {
  it('labels options A, B, C', () => {
    expect(optionDisplayLabel(0)).toBe('A');
    expect(optionDisplayLabel(2)).toBe('C');
  });

  it('creates TRUE_FALSE options with exactly two choices', () => {
    const question = applyQuestionTypeChange(emptyQuestion(), 'TRUE_FALSE');
    expect(question.options).toHaveLength(2);
    expect(question.options.map((o) => o.optionText)).toEqual(['Đúng', 'Sai']);
    expect(question.options.filter((o) => o.isCorrect)).toHaveLength(1);
  });

  it('duplicates question with new keys', () => {
    const source = emptyQuestion();
    source.questionText = 'Câu gốc';
    const copy = duplicateQuestion(source);
    expect(copy.key).not.toBe(source.key);
    expect(copy.options[0].key).not.toBe(source.options[0].key);
    expect(copy.questionText).toContain('bản sao');
  });

  it('reorders questions', () => {
    const q1 = { ...emptyQuestion(), questionText: '1' };
    const q2 = { ...emptyQuestion(), questionText: '2' };
    const reordered = reorderQuestions([q1, q2], 0, 'down');
    expect(reordered[0].questionText).toBe('2');
    expect(reordered[1].questionText).toBe('1');
  });

  it('sets exactly one correct option for single choice', () => {
    let question = emptyQuestion();
    question = setSingleCorrectOption(question, question.options[1].key);
    expect(question.options[0].isCorrect).toBe(false);
    expect(question.options[1].isCorrect).toBe(true);
  });
});
