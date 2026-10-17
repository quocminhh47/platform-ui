import { describe, expect, it } from 'vitest';
import { validateLessonForm, validateSectionForm } from './admin-curriculum.validation';

describe('admin curriculum validation', () => {
  it('validates section title', () => {
    expect(validateSectionForm({ title: '  ', sortOrder: '' }).title).toBeDefined();
    expect(validateSectionForm({ title: 'Chương 1', sortOrder: 'abc' }).sortOrder).toBeDefined();
  });

  it('validates lesson duration and title', () => {
    expect(
      validateLessonForm({
        title: '',
        lessonType: 'VIDEO',
        contentUrl: '',
        durationSeconds: '-1',
        sortOrder: '',
      }).durationSeconds,
    ).toMatch(/≥ 0/);

    expect(
      validateLessonForm({
        title: 'Bài 1',
        lessonType: 'VIDEO',
        contentUrl: '',
        durationSeconds: 'abc',
        sortOrder: '',
      }).durationSeconds,
    ).toBeDefined();
  });
});
