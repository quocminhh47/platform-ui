import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../../auth/components/FormField';
import { fieldDescribedBy } from '../../auth/components/fieldDescribedBy';
import type { User } from '../../auth/types/auth.types';
import type { Course } from '../../catalog/types/course.types';
import {
  buildAdminCoursePreview,
  instructorPreviewLabel,
} from '../utils/admin-course-preview';
import {
  adminCourseFormValuesFromCourse,
  emptyAdminCourseFormValues,
  validateAdminCourseForm,
  type AdminCourseFormField,
  type AdminCourseFormValues,
} from '../validation/admin-course-form.validation';
import { AdminCoursePreviewCard } from './AdminCoursePreviewCard';

type AdminCourseFormProps = {
  mode: 'create' | 'edit';
  course?: Course | null;
  instructors: User[];
  instructorsLoading: boolean;
  instructorsError: string | null;
  onReloadInstructors: () => void;
  formError: string | null;
  submitting: boolean;
  onSubmit: (values: AdminCourseFormValues) => Promise<void>;
};

export function AdminCourseForm({
  mode,
  course,
  instructors,
  instructorsLoading,
  instructorsError,
  onReloadInstructors,
  formError,
  submitting,
  onSubmit,
}: AdminCourseFormProps) {
  const [values, setValues] = useState<AdminCourseFormValues>(() =>
    course ? adminCourseFormValuesFromCourse(course) : emptyAdminCourseFormValues(),
  );
  const [touched, setTouched] = useState<Partial<Record<AdminCourseFormField, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const hydratedCourseId = useRef<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && course && hydratedCourseId.current !== course.id) {
      hydratedCourseId.current = course.id;
      setValues(adminCourseFormValuesFromCourse(course));
      setTouched({});
      setSubmitAttempted(false);
    }
  }, [mode, course]);

  const clientErrors = useMemo(() => validateAdminCourseForm(values, mode), [values, mode]);

  const instructorLabel =
    mode === 'edit' && course
      ? course.instructorName?.trim()
        ? `${course.instructorName} (${course.instructorId})`
        : course.instructorId
      : null;

  const previewCourse = useMemo(
    () => buildAdminCoursePreview(values, mode, course, instructors),
    [values, mode, course, instructors],
  );
  const previewInstructor =
    mode === 'create' ? instructorPreviewLabel(values, instructors) : instructorLabel;

  function errorFor(field: AdminCourseFormField): string | undefined {
    return submitAttempted || touched[field] ? clientErrors[field] : undefined;
  }

  function setField<K extends AdminCourseFormField>(field: K, value: AdminCourseFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function markTouched(field: AdminCourseFormField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitAttempted(true);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    await onSubmit(values);
  }

  return (
    <form className="auth-form admin-course-form" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <div className="section-error admin-course-form-error" role="alert">
          <p>{formError}</p>
        </div>
      ) : null}

      <div className="admin-course-form-layout">
        <div className="admin-course-form-main admin-form">
      <FormField id="admin-course-title" label="Tiêu đề" required error={errorFor('title')}>
        <input
          id="admin-course-title"
          type="text"
          maxLength={255}
          value={values.title}
          disabled={submitting}
          aria-invalid={Boolean(errorFor('title'))}
          aria-describedby={fieldDescribedBy('admin-course-title', errorFor('title'))}
          onChange={(event) => setField('title', event.target.value)}
          onBlur={() => markTouched('title')}
        />
      </FormField>

      <FormField id="admin-course-description" label="Mô tả" error={undefined}>
        <textarea
          id="admin-course-description"
          rows={4}
          value={values.description}
          disabled={submitting}
          onChange={(event) => setField('description', event.target.value)}
          onBlur={() => markTouched('description')}
        />
      </FormField>

      {mode === 'create' ? (
        <FormField
          id="admin-course-instructor"
          label="Giảng viên"
          required
          error={errorFor('instructorId')}
        >
          {instructorsLoading ? (
            <p className="muted">Đang tải danh sách giảng viên…</p>
          ) : null}
          {!instructorsLoading && instructorsError ? (
            <div className="section-error" role="alert">
              <p>{instructorsError}</p>
              <button type="button" onClick={onReloadInstructors}>
                Thử lại
              </button>
            </div>
          ) : null}
          {!instructorsLoading && !instructorsError ? (
            <select
              id="admin-course-instructor"
              value={values.instructorId}
              disabled={submitting || instructors.length === 0}
              aria-invalid={Boolean(errorFor('instructorId'))}
              aria-describedby={fieldDescribedBy(
                'admin-course-instructor',
                errorFor('instructorId'),
              )}
              onChange={(event) => setField('instructorId', event.target.value)}
              onBlur={() => markTouched('instructorId')}
            >
              <option value="">— Chọn giảng viên —</option>
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.fullName} ({instructor.email})
                </option>
              ))}
            </select>
          ) : null}
          {!instructorsLoading && !instructorsError && instructors.length === 0 ? (
            <p className="field-hint" id="admin-course-instructor-hint">
              Không có giảng viên khả dụng. Tạo tài khoản INSTRUCTOR hoặc ADMIN trước.
            </p>
          ) : null}
        </FormField>
      ) : (
        <FormField id="admin-course-instructor-readonly" label="Giảng viên">
          <p className="admin-readonly-value" id="admin-course-instructor-readonly">
            {instructorLabel}
          </p>
          <p className="field-hint" id="admin-course-instructor-readonly-hint">
            Giảng viên không thể thay đổi sau khi tạo khóa học.
          </p>
        </FormField>
      )}

      <FormField
        id="admin-course-thumbnail"
        label="URL ảnh bìa"
        error={errorFor('thumbnailUrl')}
        hint="Tùy chọn. Liên kết HTTPS tối đa 2048 ký tự."
      >
        <input
          id="admin-course-thumbnail"
          type="url"
          maxLength={2048}
          value={values.thumbnailUrl}
          disabled={submitting}
          aria-invalid={Boolean(errorFor('thumbnailUrl'))}
          aria-describedby={fieldDescribedBy(
            'admin-course-thumbnail',
            errorFor('thumbnailUrl'),
            'Tùy chọn. Liên kết HTTPS tối đa 2048 ký tự.',
          )}
          onChange={(event) => setField('thumbnailUrl', event.target.value)}
          onBlur={() => markTouched('thumbnailUrl')}
        />
      </FormField>

      <FormField
        id="admin-course-price"
        label="Giá khóa học"
        error={errorFor('price')}
        hint="Nhập giá VND hoặc chọn Miễn phí (giá = 0)."
      >
        <div className="admin-course-price-row">
          <input
            id="admin-course-price"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="admin-course-price-input"
            value={values.isFree ? '0' : values.price}
            disabled={submitting || values.isFree}
            aria-invalid={Boolean(errorFor('price'))}
            aria-describedby={fieldDescribedBy(
              'admin-course-price',
              errorFor('price'),
              'Nhập giá VND hoặc chọn Miễn phí (giá = 0).',
            )}
            onChange={(event) => setField('price', event.target.value)}
            onBlur={() => markTouched('price')}
          />
          <label htmlFor="admin-course-price-free" className="admin-course-price-free">
            <input
              id="admin-course-price-free"
              type="checkbox"
              checked={values.isFree}
              disabled={submitting}
              onChange={(event) => {
                const checked = event.target.checked;
                setValues((current) => ({
                  ...current,
                  isFree: checked,
                  price: checked ? '0' : current.price === '0' ? '' : current.price,
                }));
                markTouched('price');
              }}
            />
            <span>Miễn phí</span>
          </label>
        </div>
      </FormField>

      <div className="admin-course-published-box">
        <input
          id="admin-course-published"
          type="checkbox"
          className="admin-course-published-input"
          checked={values.published}
          disabled={submitting}
          onChange={(event) => setField('published', event.target.checked)}
        />
        <label htmlFor="admin-course-published" className="admin-course-published-label">
          <span className="admin-course-published-title">Xuất bản khóa học</span>
          <span className="admin-course-published-help">
            Khóa chưa xuất bản chỉ admin mới xem được. Bạn cũng có thể xuất bản từ danh sách khóa
            học.
          </span>
        </label>
      </div>

      <div className="admin-form-actions admin-course-form-actions">
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? 'Đang lưu…' : mode === 'create' ? 'Tạo khóa học' : 'Lưu thay đổi'}
        </button>
        <Link className="button-secondary" to="/admin/courses">
          Hủy
        </Link>
      </div>
        </div>

        <aside className="admin-course-form-preview" aria-labelledby="admin-course-preview-heading">
          <h2 id="admin-course-preview-heading" className="admin-preview-heading">Xem trước</h2>
          <p className="muted admin-preview-hint">Thẻ khóa học như học viên sẽ thấy trên danh mục.</p>
          <AdminCoursePreviewCard course={previewCourse} instructorLabel={previewInstructor} />
        </aside>
      </div>
    </form>
  );
}
