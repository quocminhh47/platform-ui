import { CourseImage } from '../../catalog/components/CourseImage';
import type { Course } from '../../catalog/types/course.types';
import { formatPrice } from '../../catalog/utils/formatPrice';

type AdminCoursePreviewCardProps = {
  course: Course;
  instructorLabel?: string | null;
};

export function AdminCoursePreviewCard({ course, instructorLabel }: AdminCoursePreviewCardProps) {
  const title = course.title.trim() || 'Tiêu đề khóa học';
  const description = course.description?.trim() || 'Chưa có mô tả.';
  const instructor =
    instructorLabel?.trim() ||
    course.instructorName?.trim() ||
    'Chưa chọn giảng viên';

  return (
    <article className="course-card admin-course-preview-card" aria-label="Xem trước thẻ khóa học">
      <CourseImage courseId={course.id} title={title} thumbnailUrl={course.thumbnailUrl} />
      <div className="course-card-body">
        <p className="admin-course-preview-badge">
          {course.published ? 'Đã xuất bản' : 'Chưa xuất bản'}
        </p>
        <h3>{title}</h3>
        <p className="course-description">{description}</p>
        <p className="course-price">{formatPrice(course.price)}</p>
        <p className="admin-course-preview-instructor muted">{instructor}</p>
      </div>
    </article>
  );
}
