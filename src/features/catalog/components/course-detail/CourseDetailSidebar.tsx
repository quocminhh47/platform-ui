import { CourseEnrollmentPanel } from '../../../enrollment/components/CourseEnrollmentPanel';
import { CourseImage } from '../CourseImage';
import type { Course } from '../../types/course.types';
import type { CurriculumSummary } from '../../utils/curriculumSummary';
import { formatPrice } from '../../utils/formatPrice';

type CourseDetailSidebarProps = {
  course: Course;
  summary: CurriculumSummary | null;
  curriculumLoading: boolean;
};

export function CourseDetailSidebar({
  course,
  summary,
  curriculumLoading,
}: CourseDetailSidebarProps) {
  return (
    <aside className="course-detail-sidebar" aria-label="Tóm tắt khóa học">
      <div className="course-detail-sidebar-card">
        <div className="course-detail-sidebar-media">
          <CourseImage
            courseId={course.id}
            title={course.title}
            thumbnailUrl={course.thumbnailUrl}
            priority
          />
        </div>
        <div className="course-detail-sidebar-body">
          <p className="course-detail-sidebar-price">{formatPrice(course.price)}</p>
          <CourseEnrollmentPanel courseId={course.id} />
          <p className="course-detail-sidebar-note">
            Học trên trình duyệt • Tiếp tục từ trang học sau khi ghi danh
          </p>
          <CourseDetailIncludes
            course={course}
            summary={summary}
            loading={curriculumLoading}
          />
        </div>
      </div>
    </aside>
  );
}

function CourseDetailIncludes({
  course,
  summary,
  loading,
}: {
  course: Course;
  summary: CurriculumSummary | null;
  loading: boolean;
}) {
  const lessonCount = summary?.lessonCount ?? course.lessonCount;

  return (
    <div className="course-detail-includes">
      <h2 className="course-detail-includes-title">Khóa học này bao gồm</h2>
      {loading ? <p className="muted">Đang tải nội dung…</p> : null}
      <ul className="course-detail-includes-list">
        {typeof lessonCount === 'number' && lessonCount > 0 ? (
          <li>{lessonCount} bài học trong chương trình</li>
        ) : null}
        {summary && summary.lessonsByType.VIDEO ? (
          <li>{summary.lessonsByType.VIDEO} bài video / lý thuyết</li>
        ) : null}
        {summary && summary.lessonsByType.ARTICLE ? (
          <li>{summary.lessonsByType.ARTICLE} tài liệu đọc</li>
        ) : null}
        {summary && summary.lessonsByType.QUIZ ? (
          <li>{summary.lessonsByType.QUIZ} bài kiểm tra (quiz)</li>
        ) : null}
        {summary && summary.lessonsByType.ASSIGNMENT ? (
          <li>{summary.lessonsByType.ASSIGNMENT} bài tập</li>
        ) : null}
        {!loading && !lessonCount ? (
          <li>Nội dung bài học sẽ được cập nhật trên chương trình.</li>
        ) : null}
      </ul>
    </div>
  );
}
