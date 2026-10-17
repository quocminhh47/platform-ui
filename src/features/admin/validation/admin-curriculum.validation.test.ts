import { describe, expect, it } from 'vitest';
import {
  createLessonPayloadFromForm,
  lessonFormValuesForTypeChange,
  updateLessonPayloadFromForm,
  validateLessonForm,
  validateSectionForm,
} from './admin-curriculum.validation';

describe('admin curriculum validation', () => {
  it('validates section title', () => {
    expect(validateSectionForm({ title: '  ', sortOrder: '' }).title).toBeDefined();
    expect(validateSectionForm({ title: 'Chương 1', sortOrder: 'abc' }).sortOrder).toBeDefined();
  });

  it('requires video URL for VIDEO lessons', () => {
    expect(
      validateLessonForm({
        title: 'Bài video',
        lessonType: 'VIDEO',
        contentUrl: '',
        durationSeconds: '',
        sortOrder: '',
      }).contentUrl,
    ).toBeDefined();
  });

  it('does not require content URL or duration for QUIZ lessons', () => {
    const errors = validateLessonForm({
      title: 'Bài quiz',
      lessonType: 'QUIZ',
      contentUrl: '',
      durationSeconds: '',
      sortOrder: '',
    });
    expect(errors.contentUrl).toBeUndefined();
    expect(errors.durationSeconds).toBeUndefined();
  });

  it('clears irrelevant fields when switching to QUIZ', () => {
    const next = lessonFormValuesForTypeChange(
      {
        title: 'Q',
        lessonType: 'VIDEO',
        contentUrl: 'https://example.com/v.mp4',
        durationSeconds: '120',
        sortOrder: '1',
      },
      'QUIZ',
    );
    expect(next.contentUrl).toBe('');
    expect(next.durationSeconds).toBe('');
  });

  it('builds create/update payloads without quiz content fields', () => {
    const quizPayload = createLessonPayloadFromForm({
      title: 'Quiz',
      lessonType: 'QUIZ',
      contentUrl: 'https://should-be-ignored.test',
      durationSeconds: '99',
      sortOrder: '',
    });
    expect(quizPayload.contentUrl).toBeNull();
    expect(quizPayload.durationSeconds).toBeNull();

    const updatePayload = updateLessonPayloadFromForm({
      title: 'Quiz',
      lessonType: 'QUIZ',
      contentUrl: 'https://ignored.test',
      durationSeconds: '1',
      sortOrder: '2',
    });
    expect(updatePayload.contentUrl).toBeNull();
    expect(updatePayload.durationSeconds).toBeNull();
  });
});
