import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../../auth/components/FormField';
import { fieldDescribedBy } from '../../auth/components/fieldDescribedBy';
import type { Lesson } from '../../catalog/types/lesson.types';
import type { Section } from '../../catalog/types/section.types';
import { createLesson, updateLesson } from '../api/admin-lessons.api';
import { createSection, updateSection } from '../api/admin-sections.api';
import {
  ADMIN_LESSON_CREATE_SUCCESS,
  ADMIN_LESSON_UPDATE_SUCCESS,
  ADMIN_SECTION_CREATE_SUCCESS,
  ADMIN_SECTION_UPDATE_SUCCESS,
  QUIZ_LESSON_HINT,
  adminCurriculumSaveMessage,
} from '../utils/admin-curriculum-messages';
import type { QuizConfigStatus } from '../hooks/useQuizConfigStatuses';
import {
  ADMIN_LESSON_TYPE_OPTIONS,
  adminLessonTypeLabel,
} from '../utils/lesson-type-labels';
import {
  emptyLessonFormValues,
  lessonFormValuesFromLesson,
  createLessonPayloadFromForm,
  lessonFormValuesForTypeChange,
  parseOptionalInt,
  sectionFormValuesFromSection,
  updateLessonPayloadFromForm,
  validateLessonForm,
  validateSectionForm,
  type LessonFormValues,
  type SectionFormValues,
} from '../validation/admin-curriculum.validation';

type AdminCurriculumSectionProps = {
  courseId: string;
  accessToken: string;
  section: Section;
  lessons: Lesson[];
  quizConfigStatuses: Record<string, QuizConfigStatus>;
  onRefresh: () => Promise<unknown>;
  onToastSuccess: (message: string) => void;
  onToastError: (message: string) => void;
};

export function AdminCurriculumSection({
  courseId,
  accessToken,
  section,
  lessons,
  quizConfigStatuses,
  onRefresh,
  onToastSuccess,
  onToastError,
}: AdminCurriculumSectionProps) {
  const [editingSection, setEditingSection] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  return (
    <article className="admin-curriculum-section" aria-labelledby={`section-${section.id}`}>
      <header className="admin-curriculum-section-header">
        <div>
          <h2 id={`section-${section.id}`}>{section.title}</h2>
          <p className="muted admin-curriculum-meta">Thứ tự: {section.sortOrder}</p>
        </div>
        {!editingSection ? (
          <button type="button" className="button-secondary" onClick={() => setEditingSection(true)}>
            Sửa chương
          </button>
        ) : null}
      </header>

      {editingSection ? (
        <AdminSectionForm
          initialValues={sectionFormValuesFromSection(section)}
          submitLabel="Lưu chương"
          onCancel={() => setEditingSection(false)}
          onSubmit={async (values) => {
            const sortOrder = parseOptionalInt(values.sortOrder);
            await updateSection(accessToken, courseId, section.id, {
              title: values.title.trim(),
              sortOrder,
            });
            onToastSuccess(ADMIN_SECTION_UPDATE_SUCCESS);
            setEditingSection(false);
            await onRefresh();
          }}
          onError={onToastError}
        />
      ) : null}

      <ul className="admin-lesson-list">
        {lessons.length === 0 ? (
          <li className="admin-lesson-empty muted">Chưa có bài học trong chương này.</li>
        ) : null}
        {lessons.map((lesson) => (
          <li key={lesson.id} className="admin-lesson-item">
            {editingLessonId === lesson.id ? (
              <AdminLessonForm
                initialValues={lessonFormValuesFromLesson(lesson)}
                submitLabel="Lưu bài học"
                onCancel={() => setEditingLessonId(null)}
                onSubmit={async (values) => {
                  await updateLesson(
                    accessToken,
                    courseId,
                    section.id,
                    lesson.id,
                    updateLessonPayloadFromForm(values),
                  );
                  onToastSuccess(ADMIN_LESSON_UPDATE_SUCCESS);
                  setEditingLessonId(null);
                  await onRefresh();
                }}
                onError={onToastError}
              />
            ) : (
              <>
                <div className="admin-lesson-summary">
                  <p className="admin-lesson-title">{lesson.title}</p>
                  <p className="muted admin-curriculum-meta">
                    {adminLessonTypeLabel(lesson.lessonType)} · Thứ tự {lesson.sortOrder}
                    {lesson.durationSeconds !== null
                      ? ` · ${lesson.durationSeconds}s`
                      : ''}
                  </p>
                  {lesson.lessonType === 'QUIZ' ? (
                    <QuizLessonStatus status={quizConfigStatuses[lesson.id] ?? 'loading'} />
                  ) : null}
                </div>
                <div className="admin-lesson-actions">
                  {lesson.lessonType === 'QUIZ' ? (
                    <Link
                      className="button-primary admin-quiz-config-link"
                      to={`/admin/courses/${courseId}/lessons/${lesson.id}/quiz`}
                    >
                      Cấu hình quiz
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => {
                      setAddingLesson(false);
                      setEditingLessonId(lesson.id);
                    }}
                  >
                    Sửa bài học
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {addingLesson ? (
        <AdminLessonForm
          initialValues={emptyLessonFormValues()}
          submitLabel="Thêm bài học"
          onCancel={() => setAddingLesson(false)}
          onSubmit={async (values) => {
            await createLesson(
              accessToken,
              courseId,
              section.id,
              createLessonPayloadFromForm(values),
            );
            onToastSuccess(ADMIN_LESSON_CREATE_SUCCESS);
            setAddingLesson(false);
            await onRefresh();
          }}
          onError={onToastError}
        />
      ) : (
        <button
          type="button"
          className="button-secondary admin-add-lesson"
          onClick={() => {
            setEditingLessonId(null);
            setAddingLesson(true);
          }}
        >
          + Thêm bài học
        </button>
      )}
    </article>
  );
}

type AdminSectionFormProps = {
  initialValues: SectionFormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: SectionFormValues) => Promise<void>;
  onError: (message: string) => void;
};

export function AdminSectionForm({
  initialValues,
  submitLabel,
  onCancel,
  onSubmit,
  onError,
}: AdminSectionFormProps) {
  const [values, setValues] = useState(initialValues);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlightRef = useRef(false);

  const clientErrors = useMemo(() => validateSectionForm(values), [values]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || inFlightRef.current) {
      return;
    }
    setSubmitAttempted(true);
    setFormError(null);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    inFlightRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (cause: unknown) {
      const message = adminCurriculumSaveMessage(cause);
      setFormError(message);
      onError(message);
    } finally {
      setSubmitting(false);
      inFlightRef.current = false;
    }
  }

  return (
    <form className="admin-inline-form" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <div className="section-error" role="alert">
          <p>{formError}</p>
        </div>
      ) : null}
      <FormField
        id="section-title"
        label="Tiêu đề chương"
        required
        error={submitAttempted ? clientErrors.title : undefined}
      >
        <input
          id="section-title"
          value={values.title}
          maxLength={255}
          disabled={submitting}
          aria-invalid={Boolean(submitAttempted && clientErrors.title)}
          aria-describedby={fieldDescribedBy(
            'section-title',
            submitAttempted ? clientErrors.title : undefined,
          )}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
        />
      </FormField>
      <FormField
        id="section-sort"
        label="Thứ tự"
        hint="Tùy chọn. Số nguyên; mặc định do hệ thống."
        error={submitAttempted ? clientErrors.sortOrder : undefined}
      >
        <input
          id="section-sort"
          inputMode="numeric"
          value={values.sortOrder}
          disabled={submitting}
          onChange={(event) =>
            setValues((current) => ({ ...current, sortOrder: event.target.value }))
          }
        />
      </FormField>
      <div className="admin-inline-form-actions">
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? 'Đang lưu…' : submitLabel}
        </button>
        <button type="button" className="button-secondary" disabled={submitting} onClick={onCancel}>
          Hủy
        </button>
      </div>
    </form>
  );
}

type AdminLessonFormProps = {
  initialValues: LessonFormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: LessonFormValues) => Promise<void>;
  onError: (message: string) => void;
};

export function AdminLessonForm({
  initialValues,
  submitLabel,
  onCancel,
  onSubmit,
  onError,
}: AdminLessonFormProps) {
  const [values, setValues] = useState(initialValues);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlightRef = useRef(false);

  const clientErrors = useMemo(() => validateLessonForm(values), [values]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || inFlightRef.current) {
      return;
    }
    setSubmitAttempted(true);
    setFormError(null);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    inFlightRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (cause: unknown) {
      const message = adminCurriculumSaveMessage(cause);
      setFormError(message);
      onError(message);
    } finally {
      setSubmitting(false);
      inFlightRef.current = false;
    }
  }

  return (
    <form className="admin-inline-form" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <div className="section-error" role="alert">
          <p>{formError}</p>
        </div>
      ) : null}
      <FormField
        id="lesson-title"
        label="Tiêu đề bài học"
        required
        error={submitAttempted ? clientErrors.title : undefined}
      >
        <input
          id="lesson-title"
          value={values.title}
          maxLength={255}
          disabled={submitting}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
        />
      </FormField>
      <FormField id="lesson-type" label="Loại bài học" required>
        <select
          id="lesson-type"
          value={values.lessonType}
          disabled={submitting}
          onChange={(event) =>
            setValues((current) =>
              lessonFormValuesForTypeChange(
                current,
                event.target.value as LessonFormValues['lessonType'],
              ),
            )
          }
        >
          {ADMIN_LESSON_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {adminLessonTypeLabel(type)}
            </option>
          ))}
        </select>
      </FormField>
      {values.lessonType === 'QUIZ' ? <p className="admin-quiz-hint">{QUIZ_LESSON_HINT}</p> : null}
      {values.lessonType === 'VIDEO' || values.lessonType === 'ARTICLE' || values.lessonType === 'ASSIGNMENT' ? (
        <FormField
          id="lesson-content-url"
          label={values.lessonType === 'VIDEO' ? 'URL video' : 'URL nội dung'}
          required={values.lessonType === 'VIDEO'}
          hint={values.lessonType === 'ARTICLE' ? 'Tùy chọn. Liên kết bài đọc hoặc tài liệu.' : values.lessonType === 'ASSIGNMENT' ? 'Tùy chọn.' : undefined}
          error={submitAttempted ? clientErrors.contentUrl : undefined}
        >
          <input
            id="lesson-content-url"
            type="url"
            value={values.contentUrl}
            disabled={submitting}
            onChange={(event) =>
              setValues((current) => ({ ...current, contentUrl: event.target.value }))
            }
          />
        </FormField>
      ) : null}
      {values.lessonType !== 'QUIZ' ? (
        <FormField
          id="lesson-duration"
          label="Thời lượng (giây)"
          hint="Tùy chọn. Phải ≥ 0 nếu nhập."
          error={submitAttempted ? clientErrors.durationSeconds : undefined}
        >
          <input
            id="lesson-duration"
            inputMode="numeric"
            value={values.durationSeconds}
            disabled={submitting}
            onChange={(event) =>
              setValues((current) => ({ ...current, durationSeconds: event.target.value }))
            }
          />
        </FormField>
      ) : null}
      <FormField
        id="lesson-sort"
        label="Thứ tự"
        hint="Tùy chọn."
        error={submitAttempted ? clientErrors.sortOrder : undefined}
      >
        <input
          id="lesson-sort"
          inputMode="numeric"
          value={values.sortOrder}
          disabled={submitting}
          onChange={(event) =>
            setValues((current) => ({ ...current, sortOrder: event.target.value }))
          }
        />
      </FormField>
      <div className="admin-inline-form-actions">
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? 'Đang lưu…' : submitLabel}
        </button>
        <button type="button" className="button-secondary" disabled={submitting} onClick={onCancel}>
          Hủy
        </button>
      </div>
    </form>
  );
}

type AdminNewSectionPanelProps = {
  courseId: string;
  accessToken: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRefresh: () => Promise<unknown>;
  onToastSuccess: (message: string) => void;
  onToastError: (message: string) => void;
};

export function AdminNewSectionPanel({
  courseId,
  accessToken,
  open,
  onOpen,
  onClose,
  onRefresh,
  onToastSuccess,
  onToastError,
}: AdminNewSectionPanelProps) {
  if (!open) {
    return (
      <button type="button" className="button-primary admin-add-section" onClick={onOpen}>
        + Thêm chương
      </button>
    );
  }

  return (
    <section className="admin-new-section" aria-label="Thêm chương mới">
      <h2 className="admin-new-section-heading">Chương mới</h2>
      <AdminSectionForm
        initialValues={{ title: '', sortOrder: '' }}
        submitLabel="Tạo chương"
        onCancel={onClose}
        onSubmit={async (values) => {
          const sortOrder = parseOptionalInt(values.sortOrder);
          await createSection(accessToken, courseId, {
            title: values.title.trim(),
            sortOrder,
          });
          onToastSuccess(ADMIN_SECTION_CREATE_SUCCESS);
          onClose();
          await onRefresh();
        }}
        onError={onToastError}
      />
    </section>
  );
}

function QuizLessonStatus({ status }: { status: QuizConfigStatus }) {
  if (status === 'loading') {
    return <p className="admin-quiz-hint muted">Đang kiểm tra cấu hình quiz…</p>;
  }
  if (status === 'configured') {
    return <p className="admin-quiz-hint admin-quiz-status-configured">Đã cấu hình quiz</p>;
  }
  if (status === 'unconfigured') {
    return <p className="admin-quiz-hint admin-quiz-status-unconfigured">Chưa cấu hình quiz</p>;
  }
  return <p className="admin-quiz-hint admin-quiz-status-error">Không thể kiểm tra trạng thái quiz</p>;
}
