import { describe, expect, it } from 'vitest';
import {
  emptyQuestion,
  formValuesToUpsertPayload,
  validateQuizBuilderForm,
  type QuizBuilderFormValues,
} from './admin-quiz-form.validation';

function validQuiz(): QuizBuilderFormValues {
  const question = emptyQuestion();
  question.questionText = 'Câu hỏi?';
  question.options[0].optionText = 'Đúng';
  question.options[0].isCorrect = true;
  question.options[1].optionText = 'Sai';
  return {
    settings: { passingScore: '80', timeLimitMinutes: '', maxAttempts: '' },
    questions: [question],
  };
}

describe('validateQuizBuilderForm', () => {
  it('requires at least one correct option for SINGLE_CHOICE', () => {
    const values = validQuiz();
    values.questions[0].options[0].isCorrect = false;
    values.questions[0].options[1].isCorrect = false;

    const errors = validateQuizBuilderForm(values, { questionsRequired: true });
    expect(errors.questions?.[values.questions[0].key]?.options).toMatch(/một đáp án/);
  });

  it('requires exactly two options for TRUE_FALSE', () => {
    const values = validQuiz();
    values.questions[0].questionType = 'TRUE_FALSE';
    values.questions[0].options.push({
      key: 'extra',
      optionText: 'Thừa',
      isCorrect: false,
    });

    const errors = validateQuizBuilderForm(values, { questionsRequired: true });
    expect(errors.questions?.[values.questions[0].key]?.options).toMatch(/hai lựa chọn/);
  });

  it('skips question validation when questions are not required', () => {
    const values = validQuiz();
    values.questions = [];

    const errors = validateQuizBuilderForm(values, { questionsRequired: false });
    expect(errors.form).toBeUndefined();
    expect(errors.questions).toBeUndefined();
  });
});

describe('formValuesToUpsertPayload', () => {
  it('omits questions when includeQuestions is false', () => {
    const payload = formValuesToUpsertPayload(validQuiz(), false);
    expect(payload.passingScore).toBe(80);
    expect(payload.questions).toBeUndefined();
  });

  it('includes questions without ids when includeQuestions is true', () => {
    const payload = formValuesToUpsertPayload(validQuiz(), true);
    expect(payload.questions?.[0].questionText).toBe('Câu hỏi?');
    expect(payload.questions?.[0].options).toHaveLength(2);
  });
});
