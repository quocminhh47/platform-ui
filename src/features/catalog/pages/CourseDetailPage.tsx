import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import {
  breadcrumbCourseTitle,
  breadcrumbCourses,
  breadcrumbHome,
} from '../../../navigation/breadcrumb-trail';
import { CourseDetailHero } from '../components/course-detail/CourseDetailHero';
import { CourseDetailInstructor } from '../components/course-detail/CourseDetailInstructor';
import { CourseDetailOverview } from '../components/course-detail/CourseDetailOverview';
import { CourseDetailSidebar } from '../components/course-detail/CourseDetailSidebar';
import { CourseCurriculum } from '../components/CourseCurriculum';
import { RelatedCourses } from '../components/RelatedCourses';
import { useCourseCurriculum } from '../hooks/useCourseCurriculum';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { summarizeCurriculum } from '../utils/curriculumSummary';

export function CourseDetailPage() {
  const { courseId } = useParams();
  const detail = useCourseDetail(courseId);
  const curriculum = useCourseCurriculum({
    courseId,
    enabled: Boolean(detail.course),
  });

  const breadcrumbTrail = [
    breadcrumbHome(),
    breadcrumbCourses(),
    breadcrumbCourseTitle(courseId ?? '', detail.course?.title, detail.loading),
  ];

  if (detail.loading) {
    return (
      <div className="course-detail-page">
        <div className="landing-container course-detail-state">
          <Breadcrumb items={breadcrumbTrail} />
          <p className="page-status course-detail-status">Đang tải khóa học…</p>
        </div>
      </div>
    );
  }

  if (detail.notFound) {
    return (
      <div className="course-detail-page">
        <div className="landing-container course-detail-state">
          <Breadcrumb items={breadcrumbTrail} />
          <section className="course-detail-empty" aria-labelledby="missing-heading">
            <h1 id="missing-heading">Course not available</h1>
            <p className="muted">
              This course may be unpublished or the link may be incorrect.
            </p>
            <Link to="/courses">Back to courses</Link>
          </section>
        </div>
      </div>
    );
  }

  if (detail.error || !detail.course) {
    return (
      <div className="course-detail-page">
        <div className="landing-container course-detail-state">
          <Breadcrumb items={breadcrumbTrail} />
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
        </div>
      </div>
    );
  }

  const course = detail.course;
  const curriculumSummary = summarizeCurriculum(curriculum.sections);

  return (
    <div className="course-detail-page">
      <CourseDetailHero course={course} breadcrumbItems={breadcrumbTrail} />
      <div className="course-detail-main landing-container">
        <div className="course-detail-layout-stitch">
          <div className="course-detail-content">
            <CourseCurriculum state={curriculum} variant="detail" />
            <CourseDetailOverview course={course} />
            <CourseDetailInstructor course={course} />
            <RelatedCourses courseId={course.id} />
          </div>
          <CourseDetailSidebar
            course={course}
            summary={curriculumSummary}
            curriculumLoading={curriculum.loading}
          />
        </div>
      </div>
    </div>
  );
}
