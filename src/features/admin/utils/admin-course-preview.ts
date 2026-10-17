import type { Course } from '../../catalog/types/course.types';
import type { User } from '../../auth/types/auth.types';
import {
  adminCourseSubmitPrice,
  type AdminCourseFormValues,
} from '../validation/admin-course-form.validation';

const PREVIEW_COURSE_ID = '00000000-0000-4000-8000-000000000099';

export function buildAdminCoursePreview(
  values: AdminCourseFormValues,
  mode: 'create' | 'edit',
  course: Course | null | undefined,
  instructors: User[],
): Course {
  const description = values.description.trim();
  const thumbnailUrl = values.thumbnailUrl.trim();
  const instructor =
    mode === 'create'
      ? instructors.find((row) => row.id === values.instructorId)
      : null;

  return {
    id: course?.id ?? PREVIEW_COURSE_ID,
    title: values.title.trim() || 'Tiêu đề khóa học',
    description: description ? description : null,
    instructorId: (course?.instructorId ?? values.instructorId) || PREVIEW_COURSE_ID,
    instructorName:
      mode === 'edit'
        ? course?.instructorName ?? null
        : instructor?.fullName ?? null,
    price: adminCourseSubmitPrice(values),
    thumbnailUrl: thumbnailUrl ? thumbnailUrl : null,
    lessonCount: course?.lessonCount,
    published: values.published,
    finalQuizId: course?.finalQuizId ?? null,
    createdAt: course?.createdAt ?? new Date().toISOString(),
    updatedAt: course?.updatedAt ?? new Date().toISOString(),
  };
}

export function instructorPreviewLabel(
  values: AdminCourseFormValues,
  instructors: User[],
): string | null {
  const instructor = instructors.find((row) => row.id === values.instructorId);
  if (!instructor) {
    return null;
  }
  return `${instructor.fullName} (${instructor.email})`;
}
