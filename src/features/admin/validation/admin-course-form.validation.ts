export type AdminCourseFormValues = {
  title: string;
  description: string;
  instructorId: string;
  thumbnailUrl: string;
  /** VND amount as entered in the price input (ignored when `isFree`). */
  price: string;
  isFree: boolean;
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

  if (!values.isFree) {
    const parsed = parseAdminCoursePriceInput(values.price);
    if (parsed === null) {
      errors.price = 'Vui lòng nhập giá hợp lệ (số nguyên dương, VND).';
    }
  }

  return errors;
}

/** Numeric price sent to the API (0 when the course is marked free). */
export function adminCourseSubmitPrice(values: AdminCourseFormValues): number {
  if (values.isFree) {
    return 0;
  }
  const parsed = parseAdminCoursePriceInput(values.price);
  return parsed ?? 0;
}

function parseAdminCoursePriceInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

export function emptyAdminCourseFormValues(): AdminCourseFormValues {
  return {
    title: '',
    description: '',
    instructorId: '',
    thumbnailUrl: '',
    price: '0',
    isFree: true,
    published: false,
  };
}

export function adminCourseFormValuesFromCourse(course: {
  title: string;
  description: string | null;
  instructorId: string;
  thumbnailUrl?: string | null;
  price: number;
  published: boolean;
}): AdminCourseFormValues {
  const isFree = !Number.isFinite(course.price) || course.price <= 0;
  return {
    title: course.title,
    description: course.description ?? '',
    instructorId: course.instructorId,
    thumbnailUrl: course.thumbnailUrl ?? '',
    price: isFree ? '0' : String(Math.trunc(course.price)),
    isFree,
    published: course.published,
  };
}
