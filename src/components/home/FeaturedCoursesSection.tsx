import { Link, useSearchParams } from 'react-router-dom';
import { HomeCourseCard } from '../../pages/home/HomeCourseCard';
import { usePublishedCourses } from '../../features/catalog/hooks/usePublishedCourses';
import {
  catalogPathWithSearchQuery,
  searchLoadedCourses,
} from '../../features/catalog/utils/courseSearch';
import { UI_COPY } from '../../ui/ui-copy';
import { SectionHeading } from '../common/SectionHeading';

const FEATURED_HEADING = 'Kho học liệu tiếng Trung & luyện thi HSK';
const FEATURED_LIMIT = 8;

export function FeaturedCoursesSection() {
  const { courses, loading, error, reload } = usePublishedCourses({ page: 0, size: 8 });
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const filtered = courses ? searchLoadedCourses(courses, query) : null;
  const visible = filtered ? filtered.slice(0, FEATURED_LIMIT) : null;
  const loadedCount = courses?.length ?? 0;

  return (
    <section className="landing-section landing-featured" id="courses" aria-labelledby="featured-heading">
      <div className="landing-container">
        <SectionHeading
          id="featured-heading"
          eyebrow="Kho tài nguyên học tập"
          title={FEATURED_HEADING}
          action={
            <Link className="landing-text-link" to={catalogPathWithSearchQuery(query)}>
              Xem tất cả khóa học
            </Link>
          }
        />
        <p className="landing-search-note">
          {query.trim()
            ? `Đang lọc “${query.trim()}” trong ${loadedCount} khóa học đã tải. Không tìm trên toàn bộ cơ sở dữ liệu.`
            : UI_COPY.catalogSearchScopeNote}
        </p>

        {loading ? <p className="page-status">Đang tải khóa học…</p> : null}

        {!loading && error ? (
          <div className="section-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={reload}>
              {UI_COPY.tryAgain}
            </button>
          </div>
        ) : null}

        {!loading && !error && courses && courses.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Chưa có khóa học đã xuất bản</p>
            <p className="muted">Khi quản trị viên xuất bản khóa học, danh sách sẽ hiện ở đây.</p>
          </div>
        ) : null}

        {!loading && !error && courses && courses.length > 0 && visible && visible.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Không có khóa học khớp</p>
            <p className="muted">Thử từ khóa khác. Kết quả chỉ đến từ danh sách đã tải.</p>
          </div>
        ) : null}

        {!loading && !error && visible && visible.length > 0 ? (
          <ul className="landing-course-grid">
            {visible.map((course) => (
              <li key={course.id}>
                <HomeCourseCard course={course} variant="landing" />
              </li>
            ))}
          </ul>
        ) : null}

        {!loading && !error && courses && courses.length > FEATURED_LIMIT ? (
          <p className="landing-featured-more">
            <Link className="landing-btn landing-btn-outline" to={catalogPathWithSearchQuery(query)}>
              Xem thêm khóa học
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
