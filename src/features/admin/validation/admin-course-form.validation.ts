export type AdminCourseFormValues = {
  title: string;
  description: string;
  instructorId: string;
  thumbnailUrl: string;
  published: boolean;
};

export type AdminCourseFormField = keyof AdminCourseFormValues;

export type AdminCourseFormErrors = Partial<Record<AdminCourseFormField, string>>;

const TITLE_MAX = 255;
const THUMBNAIL_MAX = 2048;

export function validateAdminCourseForm(
  values: AdminCourseFormValues,
  mode: 'create' | 'edit',
): AdminCourseFormErrors {
  const errors: AdminCourseFormErrors = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = 'Vui lòng nhập tiêu đề khóa học.';
  } else if (title.length > TITLE_MAX) {
    errors.title = `Tiêu đề tối đa ${TITLE_MAX} ký tự.`;
  }

  const thumbnail = values.thumbnailUrl.trim();
  if (thumbnail.length > THUMBNAIL_MAX) {
    errors.thumbnailUrl = `URL ảnh tối đa ${THUMBNAIL_MAX} ký tự.`;
  }

  if (mode === 'create' && !values.instructorId) {
    errors.instructorId = 'Vui lòng chọn giảng viên.';
  }

  return errors;
}

export function emptyAdminCourseFormValues(): AdminCourseFormValues {
  return {
    title: '',
    description: '',
    instructorId: '',
    thumbnailUrl: '',
    published: false,
  };
}

export function adminCourseFormValuesFromCourse(course: {
  title: string;
  description: string | null;
  instructorId: string;
  thumbnailUrl?: string | null;
  published: boolean;
}): AdminCourseFormValues {
  return {
    title: course.title,
    description: course.description ?? '',
    instructorId: course.instructorId,
    thumbnailUrl: course.thumbnailUrl ?? '',
    published: course.published,
  };
}
