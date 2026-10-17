import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseImage } from '../../catalog/components/CourseImage';
import { formatPrice } from '../../catalog/utils/formatPrice';
import type { Course } from '../../catalog/types/course.types';
import { publishCourse, unpublishCourse } from '../api/admin-courses.api';
import {
  ADMIN_PUBLISH_SUCCESS,
  ADMIN_UNPUBLISH_SUCCESS,
  adminPublishMessage,
} from '../utils/admin-messages';
import { instructorInitials } from '../utils/adminCourseListFilters';

type AdminCourseTableProps = {
  courses: Course[];
  accessToken: string | null;
  onPublishedChange: () => Promise<unknown>;
  onPublishError: (message: string) => void;
  onPublishSuccess: (message: string) => void;
};

export function AdminCourseTable({
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
    <div className="admin-courses-table-panel">
      <div className="admin-table-wrap admin-table-wrap--courses">
        <table className="admin-table admin-table--courses">
          <caption className="visually-hidden">Danh sách khóa học</caption>
          <thead>
            <tr>
              <th scope="col">Thông tin khóa học</th>
              <th scope="col">Giảng viên</th>
              <th scope="col" className="admin-table-col-center">Trạng thái</th>
              <th scope="col" className="admin-table-col-center">Số bài học</th>
              <th scope="col" className="admin-table-col-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <AdminCourseRow
                key={course.id}
                course={course}
                busy={busyId === course.id}
                canPublish={Boolean(accessToken)}
                onTogglePublish={() => togglePublish(course)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type AdminCourseRowProps = {
  course: Course;
  busy: boolean;
  canPublish: boolean;
  onTogglePublish: () => void;
};

function AdminCourseRow({ course, busy, canPublish, onTogglePublish }: AdminCourseRowProps) {
  const instructorLabel = course.instructorName?.trim()
    ? course.instructorName
    : course.instructorId;
  const catalogPath = `/courses/${course.id}`;

  return (
    <tr className={course.published ? undefined : 'admin-table-row-draft'}>
      <td data-label="Thông tin khóa học">
        <div className="admin-course-cell">
          <div className="admin-course-thumb">
            <CourseImage
              courseId={course.id}
              title={course.title}
              thumbnailUrl={course.thumbnailUrl}
            />
          </div>
          <div className="admin-course-cell-body">
            <div className="admin-course-title-row">
              <Link className="admin-course-title-link" to={`/admin/courses/${course.id}`}>
                {course.title}
              </Link>
              <span className="admin-course-price-tag">{formatPrice(course.price)}</span>
            </div>
            <p className="admin-course-catalog-link">
              <Link to={catalogPath} className="admin-course-catalog-path">
                {catalogPath}
              </Link>
            </p>
          </div>
        </div>
      </td>
      <td data-label="Giảng viên">
        <div className="admin-instructor-cell">
          <span className="admin-instructor-avatar" aria-hidden="true">
            {instructorInitials(course.instructorName)}
          </span>
          <span>{instructorLabel}</span>
        </div>
      </td>
      <td data-label="Trạng thái" className="admin-table-col-center">
        <span
          className={
            course.published
              ? 'admin-status-badge admin-status-badge--published'
              : 'admin-status-badge admin-status-badge--draft'
          }
        >
          <span className="admin-status-dot" aria-hidden="true" />
          {course.published ? 'Đã xuất bản' : 'Chưa xuất bản'}
        </span>
      </td>
      <td data-label="Số bài học" className="admin-table-col-center">
        <span className="admin-lesson-count">{formatLessonCount(course.lessonCount)}</span>
      </td>
      <td data-label="Thao tác" className="admin-table-col-actions">
        <div className="admin-row-actions">
          <Link className="admin-btn admin-btn-ghost" to={`/admin/courses/${course.id}`}>
            Sửa
          </Link>
          <Link
            className="admin-btn admin-btn-outline-primary"
            to={`/admin/courses/${course.id}/curriculum`}
          >
            Chương trình
          </Link>
          <button
            type="button"
            className={
              course.published
                ? 'admin-btn admin-btn-warning'
                : 'admin-btn admin-btn-success'
            }
            disabled={!canPublish || busy}
            onClick={onTogglePublish}
          >
            {busy
              ? 'Đang xử lý…'
              : course.published
                ? 'Gỡ xuất bản'
                : 'Xuất bản'}
          </button>
        </div>
      </td>
    </tr>
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
