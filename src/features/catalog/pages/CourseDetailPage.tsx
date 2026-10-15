import { Link, useParams } from 'react-router-dom';
import { SiteFooter } from '../../../components/layout/SiteFooter';
import { CourseCurriculum } from '../components/CourseCurriculum';
import { CourseImage } from '../components/CourseImage';
import { RelatedCourses } from '../components/RelatedCourses';
import { useCourseCurriculum } from '../hooks/useCourseCurriculum';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { formatPrice } from '../utils/formatPrice';

export function CourseDetailPage() {
  const { courseId } = useParams();
  const detail = useCourseDetail(courseId);
  const curriculum = useCourseCurriculum({
    courseId,
    enabled: Boolean(detail.course),
  });

  if (detail.loading) {
    return (
      <div className="marketing">
        <p className="page-status course-detail-status">Loading course…</p>
      </div>
    );
  }

  if (detail.notFound) {
    return (
      <div className="marketing">
        <section className="course-detail-empty" aria-labelledby="missing-heading">
          <h1 id="missing-heading">Course not available</h1>
          <p className="muted">
            This course may be unpublished or the link may be incorrect.
          </p>
          <Link to="/courses">Back to courses</Link>
        </section>
        <SiteFooter />
      </div>
    );
  }

  if (detail.error || !detail.course) {
    return (
      <div className="marketing">
        <section className="course-detail-empty" aria-labelledby="error-heading">
          <h1 id="error-heading">Could not load course</h1>
          <div className="section-error" role="alert">
            <p>{detail.error}</p>
            <button type="button" onClick={detail.reload}>
              Try again
            </button>
          </div>
          <Link to="/courses">Back to courses</Link>
        </section>
        <SiteFooter />
      </div>
    );
  }

  const course = detail.course;

  return (
    <div className="marketing">
      <div className="course-detail">
        <p className="course-detail-back">
          <Link to="/courses">← Back to courses</Link>
        </p>

        <header className="course-detail-header">
          <div className="course-detail-copy">
            <p className="eyebrow">Course</p>
            <h1>{course.title}</h1>
            <p className="course-detail-description">
              {course.description?.trim() ? course.description : 'No description provided.'}
            </p>
            <p className="course-detail-price">{formatPrice(course.price)}</p>
          </div>
          <div className="course-detail-banner">
            <CourseImage
              courseId={course.id}
              title={course.title}
              thumbnailUrl={course.thumbnailUrl}
              priority
            />
          </div>
        </header>

        <CourseCurriculum state={curriculum} />
        <RelatedCourses courseId={course.id} />
      </div>
      <SiteFooter />
    </div>
  );
}
