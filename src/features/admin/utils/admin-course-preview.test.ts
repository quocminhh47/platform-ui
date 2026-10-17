import { describe, expect, it } from 'vitest';
import type { User } from '../../auth/types/auth.types';
import { emptyAdminCourseFormValues } from '../validation/admin-course-form.validation';
import { buildAdminCoursePreview, instructorPreviewLabel } from './admin-course-preview';

const instructor: User = {
  id: 'inst-1',
  email: 'teacher@example.com',
  fullName: 'Giảng viên A',
  role: 'INSTRUCTOR',
  avatarUrl: null,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('admin course preview', () => {
  it('uses form values with fallbacks for empty fields', () => {
    const values = emptyAdminCourseFormValues();
    values.title = '';
    values.description = '';
    const preview = buildAdminCoursePreview(values, 'create', null, [instructor]);
    expect(preview.title).toBe('Tiêu đề khóa học');
    expect(preview.description).toBeNull();
    expect(preview.published).toBe(false);
  });

  it('reflects instructor selection in create mode', () => {
    const values = emptyAdminCourseFormValues();
    values.instructorId = instructor.id;
    values.title = 'HSK 2';
    const preview = buildAdminCoursePreview(values, 'create', null, [instructor]);
    expect(preview.title).toBe('HSK 2');
    expect(preview.instructorName).toBe('Giảng viên A');
    expect(instructorPreviewLabel(values, [instructor])).toContain('Giảng viên A');
  });
});
