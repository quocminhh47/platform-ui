import type { QuestionType } from '../types/admin-quiz.types';

export type QuizOptionFormValues = {
  key: string;
  optionText: string;
  isCorrect: boolean;
};

export type QuizQuestionFormValues = {
  key: string;
  questionText: string;
  questionType: QuestionType;
  scoreWeight: string;
  options: QuizOptionFormValues[];
};

export type QuizSettingsFormValues = {
  passingScore: string;
  timeLimitMinutes: string;
  maxAttempts: string;
};

export type QuizBuilderFormValues = {
  settings: QuizSettingsFormValues;
  questions: QuizQuestionFormValues[];
};

export type QuizFormErrors = {
  settings?: Partial<Record<keyof QuizSettingsFormValues, string>>;
  questions?: Record<string, { questionText?: string; scoreWeight?: string; options?: string }>;
  form?: string;
};

const TITLE_MAX = 10_000;

export function emptyQuizBuilderForm(): QuizBuilderFormValues {
  return {
    settings: {
      passingScore: '80',
      timeLimitMinutes: '',
      maxAttempts: '',
    },
    questions: [emptyQuestion()],
  };
}

export function emptyQuestion(): QuizQuestionFormValues {
  return {
    key: crypto.randomUUID(),
    questionText: '',
    questionType: 'SINGLE_CHOICE',
    scoreWeight: '1',
    options: [emptyOption(), emptyOption()],
  };
}

export function emptyOption(): QuizOptionFormValues {
  return {
    key: crypto.randomUUID(),
    optionText: '',
    isCorrect: false,
  };
}

export function validateQuizBuilderForm(
  values: QuizBuilderFormValues,
  options: { questionsRequired: boolean },
): QuizFormErrors {
  const errors: QuizFormErrors = {};
  const settingsErrors: Partial<Record<keyof QuizSettingsFormValues, string>> = {};

  const passing = Number.parseInt(values.settings.passingScore.trim(), 10);
  if (Number.isNaN(passing) || passing < 0 || passing > 100) {
    settingsErrors.passingScore = 'Điểm đạt phải từ 0 đến 100.';
  }

  const timeLimit = parseOptionalPositiveInt(values.settings.timeLimitMinutes);
  if (Number.isNaN(timeLimit as number)) {
    settingsErrors.timeLimitMinutes = 'Thời gian phải là số nguyên ≥ 1.';
  }

  const maxAttempts = parseOptionalPositiveInt(values.settings.maxAttempts);
  if (Number.isNaN(maxAttempts as number)) {
    settingsErrors.maxAttempts = 'Số lần làm phải là số nguyên ≥ 1.';
  }

  if (Object.keys(settingsErrors).length > 0) {
    errors.settings = settingsErrors;
  }

  if (!options.questionsRequired) {
    return errors;
  }

  if (values.questions.length === 0) {
    errors.form = 'Cần ít nhất một câu hỏi.';
    return errors;
  }

  const questionErrors: Record<string, { questionText?: string; scoreWeight?: string; options?: string }> =
    {};

  for (const question of values.questions) {
    const qErr: { questionText?: string; scoreWeight?: string; options?: string } = {};
    const text = question.questionText.trim();
    if (!text) {
      qErr.questionText = 'Vui lòng nhập nội dung câu hỏi.';
    } else if (text.length > TITLE_MAX) {
      qErr.questionText = 'Nội dung câu hỏi quá dài.';
    }

    const weight = Number.parseInt(question.scoreWeight.trim(), 10);
    if (Number.isNaN(weight) || weight < 1) {
      qErr.scoreWeight = 'Điểm câu hỏi phải ≥ 1.';
    }

    const optionTexts = question.options.map((o) => o.optionText.trim());
    if (optionTexts.some((t) => !t)) {
      qErr.options = 'Mỗi lựa chọn phải có nội dung.';
    } else if (question.options.length < 2) {
      qErr.options = 'Cần ít nhất hai lựa chọn.';
    } else {
      const correctCount = question.options.filter((o) => o.isCorrect).length;
      if (question.questionType === 'SINGLE_CHOICE' && correctCount !== 1) {
        qErr.options = 'Trắc nghiệm một đáp án: chọn đúng một lựa chọn.';
      }
      if (question.questionType === 'TRUE_FALSE') {
        if (question.options.length !== 2) {
          qErr.options = 'Đúng/Sai: cần đúng hai lựa chọn.';
        } else if (correctCount !== 1) {
          qErr.options = 'Đúng/Sai: chọn đúng một đáp án đúng.';
        }
      }
      if (question.questionType === 'MULTIPLE_CHOICE' && correctCount < 1) {
        qErr.options = 'Trắc nghiệm nhiều đáp án: chọn ít nhất một đáp án đúng.';
      }
    }

    if (Object.keys(qErr).length > 0) {
      questionErrors[question.key] = qErr;
    }
  }

  if (Object.keys(questionErrors).length > 0) {
    errors.questions = questionErrors;
  }

  return errors;
}

function parseOptionalPositiveInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return Number.NaN;
  }
  return parsed;
}

export function quizAdminToFormValues(quiz: {
  passingScore: number;
  timeLimitMinutes: number | null;
  maxAttempts: number | null;
  questions: Array<{
    questionText: string;
    questionType: QuestionType;
    scoreWeight: number;
    options: Array<{ optionText: string; isCorrect: boolean }>;
  }>;
}): QuizBuilderFormValues {
  return {
    settings: {
      passingScore: String(quiz.passingScore),
      timeLimitMinutes:
        quiz.timeLimitMinutes === null ? '' : String(quiz.timeLimitMinutes),
      maxAttempts: quiz.maxAttempts === null ? '' : String(quiz.maxAttempts),
    },
    questions: quiz.questions.map((question) => ({
      key: crypto.randomUUID(),
      questionText: question.questionText,
      questionType: question.questionType,
      scoreWeight: String(question.scoreWeight),
      options: question.options.map((option) => ({
        key: crypto.randomUUID(),
        optionText: option.optionText,
        isCorrect: option.isCorrect,
      })),
    })),
  };
}

export function formValuesToUpsertPayload(
  values: QuizBuilderFormValues,
  includeQuestions: boolean,
): import('../types/admin-quiz.types').UpsertQuizPayload {
  const passingScore = Number.parseInt(values.settings.passingScore.trim(), 10);
  const timeLimitMinutes = values.settings.timeLimitMinutes.trim();
  const maxAttempts = values.settings.maxAttempts.trim();

  const payload: import('../types/admin-quiz.types').UpsertQuizPayload = {
    passingScore,
    timeLimitMinutes: timeLimitMinutes ? Number.parseInt(timeLimitMinutes, 10) : null,
    maxAttempts: maxAttempts ? Number.parseInt(maxAttempts, 10) : null,
  };

  if (includeQuestions) {
    payload.questions = values.questions.map((question) => ({
      questionText: question.questionText.trim(),
      questionType: question.questionType,
      scoreWeight: Number.parseInt(question.scoreWeight.trim(), 10),
      options: question.options.map((option) => ({
        optionText: option.optionText.trim(),
        isCorrect: option.isCorrect,
      })),
    }));
  }

  return payload;
}
