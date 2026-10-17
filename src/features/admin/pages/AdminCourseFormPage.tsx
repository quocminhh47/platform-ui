import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../components/feedback/useToast';
import { useAuth } from '../../auth/hooks/useAuth';
import { createCourse, updateCourse } from '../api/admin-courses.api';
import { AdminCourseForm } from '../components/AdminCourseForm';
import { AdminDashboardHeader } from '../components/AdminDashboardHeader';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { useAdminCourseDetail } from '../hooks/useAdminCourseDetail';
import { useEligibleInstructors } from '../hooks/useEligibleInstructors';
import {
  ADMIN_COURSE_CREATE_SUCCESS,
  ADMIN_COURSE_UPDATE_SUCCESS,
  adminCourseSaveMessage,
} from '../utils/admin-form-messages';
import type { AdminCourseFormValues } from '../validation/admin-course-form.validation';

export function AdminCourseFormPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const isCreate = !courseId;
  const detail = useAdminCourseDetail(courseId, !isCreate && Boolean(user?.role === 'ADMIN'));
  const instructorsState = useEligibleInstructors(
    isCreate && Boolean(user?.role === 'ADMIN'),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);

  if (!user) {
    return null;
  }

  const pageLoading = isCreate ? instructorsState.loading : detail.loading;

  const pageError = !isCreate && !detail.loading && detail.error ? detail.error : null;

  async function handleSubmit(values: AdminCourseFormValues) {
    if (!accessToken || submitting || submitInFlightRef.current) {
      return;
    }
    submitInFlightRef.current = true;
    setSubmitting(true);
    setFormError(null);

    const description = values.description.trim();
    const thumbnailUrl = values.thumbnailUrl.trim();

    try {
      if (isCreate) {
        await createCourse(accessToken, {
          title: values.title.trim(),
          description: description ? description : null,
          instructorId: values.instructorId,
          price: 0,
          thumbnailUrl: thumbnailUrl ? thumbnailUrl : null,
          published: values.published,
        });
        toast.success(ADMIN_COURSE_CREATE_SUCCESS);
      } else if (courseId) {
        await updateCourse(accessToken, courseId, {
          title: values.title.trim(),
          description: description ? description : null,
          price: 0,
          thumbnailUrl: thumbnailUrl ? thumbnailUrl : null,
          published: values.published,
        });
        toast.success(ADMIN_COURSE_UPDATE_SUCCESS);
      }
      navigate('/admin/courses');
    } catch (cause: unknown) {
      setFormError(adminCourseSaveMessage(cause));
    } finally {
      setSubmitting(false);
      submitInFlightRef.current = false;
    }
  }

  return (
    <DashboardLayout
      sidebar={<DashboardSidebar />}
      header={<AdminDashboardHeader user={user} />}
    >
      <section className="admin-course-form-page" aria-labelledby="admin-course-form-heading">
        <p className="admin-form-back">
          <Link to="/admin/courses">← Danh sách khóa học</Link>
        </p>
        <h1 id="admin-course-form-heading">
          {isCreate ? 'Tạo khóa học' : 'Sửa khóa học'}
        </h1>

        {pageLoading ? <p className="page-status">Đang tải dữ liệu…</p> : null}

        {!isCreate && !detail.loading && detail.notFound ? (
          <div className="empty-state">
            <p className="empty-state-title">Không tìm thấy khóa học</p>
            <p className="muted">Liên kết có thể không đúng hoặc khóa học đã bị xóa.</p>
            <Link to="/admin/courses">Quay lại danh sách</Link>
          </div>
        ) : null}

        {!pageLoading && pageError && (isCreate || !detail.notFound) ? (
          <div className="section-error" role="alert">
            <p>{pageError}</p>
            <button
              type="button"
              onClick={() => {
                if (!isCreate) {
                  detail.reload();
                }
                instructorsState.reload();
              }}
            >
              Thử lại
            </button>
          </div>
        ) : null}

        {!pageLoading && (isCreate || (detail.course && !detail.notFound)) && !pageError ? (
          <AdminCourseForm
            mode={isCreate ? 'create' : 'edit'}
            course={detail.course}
            instructors={instructorsState.instructors}
            instructorsLoading={instructorsState.loading}
            instructorsError={instructorsState.error}
            onReloadInstructors={instructorsState.reload}
            formError={formError}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        ) : null}
      </section>
    </DashboardLayout>
  );
}
