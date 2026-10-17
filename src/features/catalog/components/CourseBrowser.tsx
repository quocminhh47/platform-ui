import { useSearchParams } from 'react-router-dom';
import { HomeCourseCard } from '../../../pages/home/HomeCourseCard';
import { usePublishedCourses } from '../hooks/usePublishedCourses';
import { searchLoadedCourses } from '../utils/courseSearch';

type CourseBrowserProps = {
  heading: string;
  variant?: 'default' | 'landing';
};

export function CourseBrowser({ heading, variant = 'default' }: CourseBrowserProps) {
  const { courses, loading, error, reload } = usePublishedCourses();
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const visible = courses ? searchLoadedCourses(courses, query) : null;
  const loadedCount = courses?.length ?? 0;
  const isLanding = variant === 'landing';

  const content = (
    <>
      {isLanding ? (
        <h2 className="landing-section-title">{heading}</h2>
      ) : (
        <>
          <div className="home-kicker" aria-hidden="true">
            <span className="home-kicker-bar home-kicker-bar-teal" />
            <span className="home-kicker-bar home-kicker-bar-cyan" />
            <span className="home-kicker-bar home-kicker-bar-blue" />
          </div>
          <h2 className="home-kicker-label">{heading}</h2>
        </>
      )}
      <p className={isLanding ? 'landing-search-note' : 'home-search-scope'}>
        {query.trim()
          ? `Đang lọc “${query.trim()}” trong ${loadedCount} khóa học đã tải. Không tìm trên toàn bộ cơ sở dữ liệu.`
          : 'Ô tìm kiếm chỉ lọc các khóa học đã tải trên trang này, không tìm trên toàn bộ cơ sở dữ liệu.'}
      </p>

      {loading ? <p className="page-status">Đang tải khóa học…</p> : null}

      {!loading && error ? (
        <div className="section-error" role="alert">
          <p>Không tải được danh sách khóa học. Vui lòng thử lại.</p>
          <button type="button" onClick={reload}>
            Thử lại
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
        <ul className={isLanding ? 'landing-course-grid' : 'home-course-grid'}>
          {visible.map((course) => (
            <li key={course.id}>
              <HomeCourseCard course={course} variant={isLanding ? 'landing' : 'default'} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  if (isLanding) {
    return (
      <section className="landing-section landing-catalog-browser">
        <div className="landing-container">{content}</div>
      </section>
    );
  }

  return <div className="home-workspace">{content}</div>;
}
