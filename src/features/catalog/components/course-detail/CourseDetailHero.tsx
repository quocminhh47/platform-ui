import type { BreadcrumbItem } from '../../../../components/common/Breadcrumb';
import { Breadcrumb } from '../../../../components/common/Breadcrumb';
import type { Course } from '../../types/course.types';
import { formatPrice } from '../../utils/formatPrice';

type CourseDetailHeroProps = {
  course: Course;
  breadcrumbItems: BreadcrumbItem[];
};

export function CourseDetailHero({ course, breadcrumbItems }: CourseDetailHeroProps) {
  const description = course.description?.trim();
  const instructorName = course.instructorName?.trim();
  const updatedLabel = formatUpdatedDate(course.updatedAt);

  return (
    <section className="course-detail-hero" aria-labelledby="course-detail-title">
      <div className="landing-container course-detail-hero-inner">
        <Breadcrumb items={breadcrumbItems} className="app-breadcrumb--inverse" />
        <div className="course-detail-hero-grid">
          <div className="course-detail-hero-copy">
            <div className="course-detail-badges">
              <span className="course-detail-badge">Khóa học tiếng Trung</span>
              {course.price <= 0 ? (
                <span className="course-detail-badge course-detail-badge-accent">Miễn phí</span>
              ) : null}
            </div>
            <h1 id="course-detail-title">{course.title}</h1>
            {description ? <p className="course-detail-hero-lead">{description}</p> : null}
            <ul className="course-detail-hero-meta" aria-label="Thông tin khóa học">
              {updatedLabel ? (
                <li>
                  <MetaClockIcon />
                  <span>
                    Cập nhật: <strong>{updatedLabel}</strong>
                  </span>
                </li>
              ) : null}
              <li>
                <MetaLangIcon />
                <span>Tiếng Việt / Tiếng Trung</span>
              </li>
              {typeof course.lessonCount === 'number' ? (
                <li>
                  <MetaBookIcon />
                  <span>
                    {course.lessonCount === 1
                      ? '1 bài học'
                      : `${course.lessonCount} bài học`}
                  </span>
                </li>
              ) : null}
              <li>
                <MetaPriceIcon />
                <span>{formatPrice(course.price)}</span>
              </li>
            </ul>
            {instructorName ? (
              <p className="course-detail-hero-instructor">
                <span className="course-detail-instructor-avatar" aria-hidden="true">
                  {initials(instructorName)}
                </span>
                <span>
                  Giảng viên phụ trách:{' '}
                  <a className="course-detail-instructor-link" href="#course-instructor">
                    {instructorName}
                  </a>
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatUpdatedDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('vi-VN', {
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function MetaClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MetaLangIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
      <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MetaBookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MetaPriceIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
      <path d="M12 8c-2.5 0-4 1.2-4 3s1.5 3 4 3 4 1.2 4 3-1.5 3-4 3m0-12V6m0 12v2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
