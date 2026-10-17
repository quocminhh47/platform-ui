import type { Course } from '../../types/course.types';

type CourseDetailOverviewProps = {
  course: Course;
};

export function CourseDetailOverview({ course }: CourseDetailOverviewProps) {
  const description = course.description?.trim();
  if (!description) {
    return null;
  }

  return (
    <section className="course-detail-panel" aria-labelledby="course-overview-heading">
      <h2 id="course-overview-heading">Mô tả chi tiết</h2>
      <div className="course-detail-overview-body">
        <p>{description}</p>
        <aside className="course-detail-callout">
          <strong>Gợi ý học hiệu quả:</strong> Làm theo thứ tự bài trong chương trình, ôn lại
          phần nghe–nói trước khi làm quiz, và theo dõi tiến độ trong không gian học sau khi ghi
          danh.
        </aside>
      </div>
    </section>
  );
}
