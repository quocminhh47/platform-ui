import { describe, expect, it } from 'vitest';
import { validateAdminCourseForm } from './admin-course-form.validation';

describe('validateAdminCourseForm', () => {
  const base = {
    title: 'Khóa HSK 1',
    description: '',
    instructorId: 'inst-1',
    thumbnailUrl: '',
    published: false,
  };

  it('requires title and instructor on create', () => {
    expect(
      validateAdminCourseForm(
        { ...base, title: '  ', instructorId: '' },
        'create',
      ).title,
    ).toBeDefined();
    expect(
      validateAdminCourseForm({ ...base, title: '  ', instructorId: '' }, 'create')
        .instructorId,
    ).toBeDefined();
  });

  it('does not require instructor on edit', () => {
    const errors = validateAdminCourseForm({ ...base, instructorId: '' }, 'edit');
    expect(errors.instructorId).toBeUndefined();
  });

  it('enforces max lengths', () => {
    const errors = validateAdminCourseForm(
      {
        ...base,
        title: 'x'.repeat(256),
        thumbnailUrl: 'https://example.com/' + 'a'.repeat(2048),
      },
      'create',
    );
    expect(errors.title).toMatch(/255/);
    expect(errors.thumbnailUrl).toMatch(/2048/);
  });
});
