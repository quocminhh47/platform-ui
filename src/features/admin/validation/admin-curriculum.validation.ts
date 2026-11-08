import type { LessonType } from '../../catalog/types/lesson.types';
import type { CreateLessonPayload, UpdateLessonPayload } from '../types/lesson-request.types';
import { validateHttpUrl } from './admin-url.validation';

export type SectionFormValues = {
  title: string;
};

export type LessonFormValues = {
  title: string;
  lessonType: LessonType;
  contentUrl: string;
  durationSeconds: string;
};

export type SectionFormErrors = Partial<Record<keyof SectionFormValues, string>>;
export type LessonFormErrors = Partial<Record<keyof LessonFormValues, string>>;

const TITLE_MAX = 255;

export function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
}

export function validateSectionForm(values: SectionFormValues): SectionFormErrors {
  const errors: SectionFormErrors = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = 'Vui lòng nhập tiêu đề chương.';
  } else if (title.length > TITLE_MAX) {
    errors.title = `Tiêu đề tối đa ${TITLE_MAX} ký tự.`;
  }

  return errors;
}

export function validateLessonForm(values: LessonFormValues): LessonFormErrors {
  const errors: LessonFormErrors = {};
  const title = values.title.trim();
  const type = values.lessonType;

  if (!title) {
    errors.title = 'Vui lòng nhập tiêu đề bài học.';
  } else if (title.length > TITLE_MAX) {
    errors.title = `Tiêu đề tối đa ${TITLE_MAX} ký tự.`;
  }

  if (type === 'VIDEO') {
    const urlError = validateHttpUrl(values.contentUrl, true);
    if (urlError) {
      errors.contentUrl = urlError === 'Vui lòng nhập URL.' ? 'Vui lòng nhập URL video.' : urlError;
    }
  } else if (type === 'ARTICLE') {
    const urlError = validateHttpUrl(values.contentUrl, true);
    if (urlError) {
      errors.contentUrl =
        urlError === 'Vui lòng nhập URL.' ? 'Vui lòng nhập URL bài đọc.' : urlError;
    }
  } else if (type === 'ASSIGNMENT') {
    const urlError = validateHttpUrl(values.contentUrl, false);
    if (urlError) {
      errors.contentUrl = urlError;
    }
  }

  if (type !== 'QUIZ') {
    const duration = parseOptionalInt(values.durationSeconds);
    if (Number.isNaN(duration)) {
      errors.durationSeconds = 'Thời lượng phải là số nguyên.';
    } else if (duration !== undefined && duration < 0) {
      errors.durationSeconds = 'Thời lượng phải ≥ 0.';
    }
  }

  return errors;
}

export function lessonFormValuesForTypeChange(
  current: LessonFormValues,
  nextType: LessonType,
): LessonFormValues {
  if (nextType === 'QUIZ') {
    return {
      ...current,
      lessonType: nextType,
      contentUrl: '',
      durationSeconds: '',
    };
  }
  if (current.lessonType === 'QUIZ') {
    return {
      ...current,
      lessonType: nextType,
      contentUrl: '',
      durationSeconds: '',
    };
  }
  return { ...current, lessonType: nextType };
}

export function createLessonPayloadFromForm(values: LessonFormValues): CreateLessonPayload {
  const payload: CreateLessonPayload = {
    title: values.title.trim(),
    lessonType: values.lessonType,
  };
  if (values.lessonType === 'QUIZ') {
    payload.contentUrl = null;
    payload.durationSeconds = null;
    return payload;
  }
  const contentUrl = values.contentUrl.trim();
  payload.contentUrl = contentUrl ? contentUrl : null;
  const durationSeconds = parseOptionalInt(values.durationSeconds);
  payload.durationSeconds =
    durationSeconds === undefined || Number.isNaN(durationSeconds) ? null : durationSeconds;
  return payload;
}

export function updateLessonPayloadFromForm(values: LessonFormValues): UpdateLessonPayload {
  const payload: UpdateLessonPayload = {
    title: values.title.trim(),
    lessonType: values.lessonType,
  };
  if (values.lessonType === 'QUIZ') {
    payload.contentUrl = null;
    payload.durationSeconds = null;
    return payload;
  }
  const contentUrl = values.contentUrl.trim();
  payload.contentUrl = contentUrl ? contentUrl : null;
  const durationSeconds = parseOptionalInt(values.durationSeconds);
  payload.durationSeconds =
    durationSeconds === undefined || Number.isNaN(durationSeconds) ? null : durationSeconds;
  return payload;
}

export function emptySectionFormValues(): SectionFormValues {
  return { title: '' };
}

export function sectionFormValuesFromSection(section: { title: string }): SectionFormValues {
  return {
    title: section.title,
  };
}

export function emptyLessonFormValues(): LessonFormValues {
  return {
    title: '',
    lessonType: 'VIDEO',
    contentUrl: '',
    durationSeconds: '',
  };
}

export function lessonFormValuesFromLesson(lesson: {
  title: string;
  lessonType: LessonType;
  contentUrl: string | null;
  durationSeconds: number | null;
}): LessonFormValues {
  return {
    title: lesson.title,
    lessonType: lesson.lessonType,
    contentUrl: lesson.contentUrl ?? '',
    durationSeconds:
      lesson.durationSeconds === null ? '' : String(lesson.durationSeconds),
  };
}
