import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../components/feedback/useToast';
import { useAuth } from '../../auth/hooks/useAuth';
import { publishCourse, unpublishCourse } from '../api/admin-courses.api';
import { AdminDashboardHeader } from '../components/AdminDashboardHeader';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import type { Course } from '../../catalog/types/course.types';
import { useAdminCourses } from '../hooks/useAdminCourses';
import {
  ADMIN_PUBLISH_SUCCESS,
  ADMIN_UNPUBLISH_SUCCESS,
  adminPublishMessage,
} from '../utils/admin-messages';

export function AdminCourseListPage() {
  const { user, accessToken } = useAuth();
  const coursesState = useAdminCourses(Boolean(user?.role === 'ADMIN'));
  const toast = useToast();

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout
      sidebar={<DashboardSidebar />}
      header={<AdminDashboardHeader user={user} />}
    >
      <section className="admin-courses" aria-labelledby="admin-courses-heading">
        <div className="admin-courses-toolbar">
          <h1 id="admin-courses-heading">Quản lý khóa học</h1>
          <Link className="button-primary" to="/admin/courses/new">
            Tạo khóa học
          </Link>
        </div>

        {coursesState.loading ? (
          <p className="page-status">Đang tải danh sách khóa học…</p>
        ) : null}

        {!coursesState.loading && coursesState.error ? (
          <div className="section-error" role="alert">
            <p>{coursesState.error}</p>
            <button type="button" onClick={coursesState.reload}>
              Thử lại
            </button>
          </div>
        ) : null}

        {!coursesState.loading && !coursesState.error && coursesState.courses?.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Chưa có khóa học nào</p>
            <p className="muted">Tạo khóa học đầu tiên để bắt đầu.</p>
            <Link className="button-primary" to="/admin/courses/new">
              Tạo khóa học
            </Link>
          </div>
        ) : null}

        {!coursesState.loading && !coursesState.error && coursesState.courses?.length ? (
          <AdminCourseTable
            courses={coursesState.courses}
            accessToken={accessToken}
            onPublishedChange={() => coursesState.refresh()}
            onPublishError={(message) => toast.error(message)}
            onPublishSuccess={(message) => toast.success(message)}
          />
        ) : null}
      </section>
    </DashboardLayout>
  );
}

type AdminCourseTableProps = {
  courses: Course[];
  accessToken: string | null;
  onPublishedChange: () => Promise<unknown>;
  onPublishError: (message: string) => void;
  onPublishSuccess: (message: string) => void;
};

function AdminCourseTable({
  courses,
  accessToken,
  onPublishedChange,
  onPublishError,
  onPublishSuccess,
}: AdminCourseTableProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const inFlightRef = useRef<string | null>(null);

  async function togglePublish(course: Course) {
    if (!accessToken || busyId || inFlightRef.current) {
      return;
    }
    inFlightRef.current = course.id;
    setBusyId(course.id);
    try {
      if (course.published) {
        await unpublishCourse(accessToken, course.id);
        onPublishSuccess(ADMIN_UNPUBLISH_SUCCESS);
      } else {
        await publishCourse(accessToken, course.id);
        onPublishSuccess(ADMIN_PUBLISH_SUCCESS);
      }
      await onPublishedChange();
    } catch (cause: unknown) {
      onPublishError(adminPublishMessage(cause));
    } finally {
      inFlightRef.current = null;
      setBusyId(null);
    }
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <caption className="visually-hidden">Danh sách khóa học</caption>
        <thead>
          <tr>
            <th scope="col">Tiêu đề</th>
            <th scope="col">Giảng viên</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Số bài học</th>
            <th scope="col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td data-label="Tiêu đề">
                <span className="admin-table-title">{course.title}</span>
              </td>
              <td data-label="Giảng viên">
                {course.instructorName?.trim() ? course.instructorName : course.instructorId}
              </td>
              <td data-label="Trạng thái">
                <span
                  className={
                    course.published ? 'admin-badge admin-badge--published' : 'admin-badge'
                  }
                >
                  {course.published ? 'Đã xuất bản' : 'Chưa xuất bản'}
                </span>
              </td>
              <td data-label="Số bài học">{formatLessonCount(course.lessonCount)}</td>
              <td data-label="Thao tác">
                <div className="admin-table-actions">
                  <Link to={`/admin/courses/${course.id}`}>Sửa</Link>
                  <Link to={`/admin/courses/${course.id}/curriculum`}>Chương trình</Link>
                  <button
                    type="button"
                    className="link-button"
                    disabled={!accessToken || busyId === course.id}
                    onClick={() => togglePublish(course)}
                  >
                    {busyId === course.id
                      ? 'Đang xử lý…'
                      : course.published
                        ? 'Gỡ xuất bản'
                        : 'Xuất bản'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatLessonCount(count: number | undefined): string {
  if (typeof count !== 'number') {
    return '—';
  }
  if (count === 1) {
    return '1 bài học';
  }
  return `${count} bài học`;
}
