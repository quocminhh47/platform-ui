import { describe, expect, it } from 'vitest';
import type { QuizQuestionStudentView } from '../types/quiz.types';
import {
  buildSubmitPayload,
  toggleMultipleAnswer,
  toggleSingleAnswer,
  validateAnswersForSubmit,
} from './quizAnswers';

const questions: QuizQuestionStudentView[] = [
  {
    id: 'q1',
    questionText: 'One',
    questionType: 'SINGLE_CHOICE',
    options: [
      { id: 'o1', optionText: 'A' },
      { id: 'o2', optionText: 'B' },
    ],
  },
  {
    id: 'q2',
    questionText: 'Many',
    questionType: 'MULTIPLE_CHOICE',
    options: [
      { id: 'o3', optionText: 'C' },
      { id: 'o4', optionText: 'D' },
    ],
  },
];

describe('quizAnswers', () => {
  it('toggles single and multiple selections', () => {
    let answers = toggleSingleAnswer({}, 'q1', 'o1');
    expect(answers.q1).toEqual(['o1']);
    answers = toggleSingleAnswer(answers, 'q1', 'o2');
    expect(answers.q1).toEqual(['o2']);

    answers = toggleMultipleAnswer(answers, 'q2', 'o3');
    answers = toggleMultipleAnswer(answers, 'q2', 'o4');
    expect(answers.q2).toEqual(['o3', 'o4']);
    answers = toggleMultipleAnswer(answers, 'q2', 'o3');
    expect(answers.q2).toEqual(['o4']);
  });

  it('validates and builds submit payload', () => {
    const invalid = validateAnswersForSubmit(questions, { q1: ['o1', 'o2'] });
    expect(invalid).toBeTruthy();

    const answers = { q1: ['o1'], q2: [] };
    expect(validateAnswersForSubmit(questions, answers)).toBeNull();
    expect(buildSubmitPayload(questions, answers).answers).toEqual([
      { questionId: 'q1', selectedOptionIds: ['o1'] },
      { questionId: 'q2', selectedOptionIds: [] },
    ]);
  });
});
