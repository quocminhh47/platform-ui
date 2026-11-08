import { Link, useParams } from 'react-router-dom';
import { AdminMemberPageShell } from '../../../components/layout/AdminMemberPageShell';
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
      <AdminMemberPageShell>
      <div className="course-detail-page">
        <div className="landing-container course-detail-state">
          <Breadcrumb items={breadcrumbTrail} />
          <p className="page-status course-detail-status">Đang tải khóa học…</p>
        </div>
      </div>
      </AdminMemberPageShell>
    );
  }

  if (detail.notFound) {
    return (
      <AdminMemberPageShell>
      <div className="course-detail-page">
        <div className="landing-container course-detail-state">
          <Breadcrumb items={breadcrumbTrail} />
          <section className="course-detail-empty" aria-labelledby="missing-heading">
            <h1 id="missing-heading">Khóa học không khả dụng</h1>
            <p className="muted">
              Khóa học có thể chưa xuất bản hoặc đường dẫn không đúng.
            </p>
            <Link to="/courses">Quay lại danh mục</Link>
          </section>
        </div>
      </div>
      </AdminMemberPageShell>
    );
  }

  if (detail.error || !detail.course) {
    return (
      <AdminMemberPageShell>
      <div className="course-detail-page">
        <div className="landing-container course-detail-state">
          <Breadcrumb items={breadcrumbTrail} />
          <section className="course-detail-empty" aria-labelledby="error-heading">
            <h1 id="error-heading">Không tải được khóa học</h1>
            <div className="section-error" role="alert">
              <p>{detail.error}</p>
              <button type="button" onClick={detail.reload}>
                Thử lại
              </button>
            </div>
            <Link to="/courses">Quay lại danh mục</Link>
          </section>
        </div>
      </div>
      </AdminMemberPageShell>
    );
  }

  const course = detail.course;
  const curriculumSummary = summarizeCurriculum(curriculum.sections);

  return (
    <AdminMemberPageShell>
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
    </AdminMemberPageShell>
  );
}
