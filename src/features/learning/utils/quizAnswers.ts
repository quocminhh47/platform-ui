import type { QuizQuestionStudentView } from '../types/quiz.types';

export type AnswerMap = Record<string, string[]>;

export function toggleSingleAnswer(
  current: AnswerMap,
  questionId: string,
  optionId: string,
): AnswerMap {
  return { ...current, [questionId]: [optionId] };
}

export function toggleMultipleAnswer(
  current: AnswerMap,
  questionId: string,
  optionId: string,
): AnswerMap {
  const existing = current[questionId] ?? [];
  const next = existing.includes(optionId)
    ? existing.filter((id) => id !== optionId)
    : [...existing, optionId];
  return { ...current, [questionId]: next };
}

export function validateAnswersForSubmit(
  questions: QuizQuestionStudentView[],
  answers: AnswerMap,
): string | null {
  for (const question of questions) {
    const selected = answers[question.id] ?? [];
    if (question.questionType === 'MULTIPLE_CHOICE') {
      continue;
    }
    if (selected.length > 1) {
      return 'Vui lòng chọn một đáp án cho mỗi câu hỏi.';
    }
  }
  return null;
}

export function buildSubmitPayload(questions: QuizQuestionStudentView[], answers: AnswerMap) {
  return {
    answers: questions.map((question) => ({
      questionId: question.id,
      selectedOptionIds: answers[question.id] ?? [],
    })),
  };
}
