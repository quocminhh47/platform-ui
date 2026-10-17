import type { QuestionType } from '../types/admin-quiz.types';
import {
  emptyOption,
  type QuizOptionFormValues,
  type QuizQuestionFormValues,
} from '../validation/admin-quiz-form.validation';

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function optionDisplayLabel(index: number): string {
  if (index < OPTION_LETTERS.length) {
    return OPTION_LETTERS[index];
  }
  return String(index + 1);
}

export function createTrueFalseOptions(
  existing?: QuizOptionFormValues[],
  correctIsTrue = true,
): QuizOptionFormValues[] {
  return [
    {
      key: existing?.[0]?.key ?? crypto.randomUUID(),
      optionText: 'Đúng',
      isCorrect: correctIsTrue,
    },
    {
      key: existing?.[1]?.key ?? crypto.randomUUID(),
      optionText: 'Sai',
      isCorrect: !correctIsTrue,
    },
  ];
}

export function applyQuestionTypeChange(
  question: QuizQuestionFormValues,
  nextType: QuestionType,
): QuizQuestionFormValues {
  if (nextType === 'TRUE_FALSE') {
    const correct = question.options.find((option) => option.isCorrect);
    const correctIsTrue = correct ? correct.optionText.trim().toLowerCase() !== 'sai' : true;
    return {
      ...question,
      questionType: nextType,
      options: createTrueFalseOptions(question.options, correctIsTrue),
    };
  }
  return { ...question, questionType: nextType };
}

export function duplicateQuestion(question: QuizQuestionFormValues): QuizQuestionFormValues {
  return {
    ...question,
    key: crypto.randomUUID(),
    questionText: question.questionText ? `${question.questionText} (bản sao)` : '',
    options: question.options.map((option) => ({
      ...option,
      key: crypto.randomUUID(),
    })),
  };
}

export function reorderQuestions(
  questions: QuizQuestionFormValues[],
  fromIndex: number,
  direction: 'up' | 'down',
): QuizQuestionFormValues[] {
  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
  if (toIndex < 0 || toIndex >= questions.length) {
    return questions;
  }
  const next = [...questions];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function setSingleCorrectOption(
  question: QuizQuestionFormValues,
  optionKey: string,
): QuizQuestionFormValues {
  return {
    ...question,
    options: question.options.map((option) => ({
      ...option,
      isCorrect: option.key === optionKey,
    })),
  };
}

export function toggleMultipleCorrectOption(
  question: QuizQuestionFormValues,
  optionKey: string,
): QuizQuestionFormValues {
  return {
    ...question,
    options: question.options.map((option) =>
      option.key === optionKey ? { ...option, isCorrect: !option.isCorrect } : option,
    ),
  };
}

export function questionTypeLabel(type: QuestionType): string {
  switch (type) {
    case 'SINGLE_CHOICE':
      return 'Trắc nghiệm một đáp án';
    case 'MULTIPLE_CHOICE':
      return 'Trắc nghiệm nhiều đáp án';
    case 'TRUE_FALSE':
      return 'Đúng / Sai';
  }
}

export function addOptionToQuestion(question: QuizQuestionFormValues): QuizQuestionFormValues {
  return {
    ...question,
    options: [...question.options, emptyOption()],
  };
}

export function removeOptionFromQuestion(
  question: QuizQuestionFormValues,
  optionKey: string,
): QuizQuestionFormValues {
  const remaining = question.options.filter((option) => option.key !== optionKey);
  if (remaining.length === 0) {
    return question;
  }
  const removedWasCorrect = question.options.find((o) => o.key === optionKey)?.isCorrect;
  if (removedWasCorrect && question.questionType !== 'MULTIPLE_CHOICE') {
    remaining[0].isCorrect = true;
  }
  return { ...question, options: remaining };
}
