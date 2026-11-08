import { describe, expect, it } from 'vitest';
import {
  createLessonPayloadFromForm,
  lessonFormValuesForTypeChange,
  lessonFormValuesFromLesson,
  updateLessonPayloadFromForm,
  validateLessonForm,
  validateSectionForm,
} from './admin-curriculum.validation';

describe('admin curriculum validation', () => {
  it('validates section title', () => {
    expect(validateSectionForm({ title: '  ' }).title).toBeDefined();
    expect(validateSectionForm({ title: 'Chương 1' }).title).toBeUndefined();
  });

  it('requires video URL for VIDEO lessons', () => {
    expect(
      validateLessonForm({
        title: 'Bài video',
        lessonType: 'VIDEO',
        contentUrl: '',
        durationSeconds: '',
      }).contentUrl,
    ).toBeDefined();
  });

  it('requires article URL for ARTICLE lessons', () => {
    expect(
      validateLessonForm({
        title: 'Read',
        lessonType: 'ARTICLE',
        contentUrl: '',
        durationSeconds: '',
      }).contentUrl,
    ).toBeDefined();
  });

  it('does not require content URL or duration for QUIZ lessons', () => {
    const errors = validateLessonForm({
      title: 'Bài quiz',
      lessonType: 'QUIZ',
      contentUrl: '',
      durationSeconds: '',
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
      },
      'QUIZ',
    );
    expect(next.contentUrl).toBe('');
    expect(next.durationSeconds).toBe('');
  });

  it('maps lesson entities to form values for edit prepopulation', () => {
    expect(
      lessonFormValuesFromLesson({
        title: 'Welcome',
        lessonType: 'VIDEO',
        contentUrl: 'https://example.com/v.mp4',
        durationSeconds: 300,
      }),
    ).toEqual({
      title: 'Welcome',
      lessonType: 'VIDEO',
      contentUrl: 'https://example.com/v.mp4',
      durationSeconds: '300',
    });
    expect(
      lessonFormValuesFromLesson({
        title: 'Quiz 1',
        lessonType: 'QUIZ',
        contentUrl: null,
        durationSeconds: null,
      }).contentUrl,
    ).toBe('');
  });

  it('builds create/update payloads without quiz content fields', () => {
    const quizPayload = createLessonPayloadFromForm({
      title: 'Quiz',
      lessonType: 'QUIZ',
      contentUrl: 'https://should-be-ignored.test',
      durationSeconds: '99',
    });
    expect(quizPayload.contentUrl).toBeNull();
    expect(quizPayload.durationSeconds).toBeNull();
    expect(quizPayload.sortOrder).toBeUndefined();

    const updatePayload = updateLessonPayloadFromForm({
      title: 'Quiz',
      lessonType: 'QUIZ',
      contentUrl: 'https://ignored.test',
      durationSeconds: '1',
    });
    expect(updatePayload.contentUrl).toBeNull();
    expect(updatePayload.durationSeconds).toBeNull();
    expect(updatePayload.sortOrder).toBeUndefined();
  });
});
