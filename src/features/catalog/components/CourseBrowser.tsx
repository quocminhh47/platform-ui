import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PaginationControls } from '../../../components/common/PaginationControls';
import { UI_COPY } from '../../../ui/ui-copy';
import { HomeCourseCard } from '../../../pages/home/HomeCourseCard';
import { usePublishedCourses } from '../hooks/usePublishedCourses';

type CourseBrowserProps = {
  heading: string;
  variant?: 'default' | 'landing';
};

export function CourseBrowser({ heading, variant = 'default' }: CourseBrowserProps) {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const page = Number.parseInt(params.get('page') ?? '0', 10);
  const safePage = Number.isNaN(page) || page < 0 ? 0 : page;
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      const next = new URLSearchParams(params);
      if (trimmed) {
        next.set('q', trimmed);
      } else {
        next.delete('q');
      }
      next.set('page', '0');
      if (next.toString() !== params.toString()) {
        setParams(next, { replace: true });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, params, setParams]);

  const { courses, page: pageData, loading, error, reload } = usePublishedCourses({
    page: safePage,
    size: 12,
    q: query,
  });

  const isLanding = variant === 'landing';
  const totalElements = pageData?.totalElements ?? 0;

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    setParams(next);
  }

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

      <label className="catalog-search-field">
        <span className="visually-hidden">Tìm khóa học</span>
        <input
          type="search"
          value={searchInput}
          placeholder="Tìm theo tên khóa học, mô tả hoặc giảng viên…"
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </label>

      <p className={isLanding ? 'landing-search-note' : 'home-search-scope'}>
        {query.trim()
          ? `Đang tìm “${query.trim()}” trên toàn bộ khóa học đã xuất bản (${totalElements} kết quả).`
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
          <p className="empty-state-title">
            {query.trim() ? 'Không có khóa học khớp' : 'Chưa có khóa học đã xuất bản'}
          </p>
          <p className="muted">
            {query.trim()
              ? 'Thử từ khóa khác hoặc xóa bộ lọc tìm kiếm.'
              : 'Khi quản trị viên xuất bản khóa học, danh sách sẽ hiện ở đây.'}
          </p>
        </div>
      ) : null}

      {!loading && !error && courses && courses.length > 0 ? (
        <>
          <ul className={isLanding ? 'landing-course-grid' : 'home-course-grid'}>
            {courses.map((course) => (
              <li key={course.id}>
                <HomeCourseCard course={course} variant={isLanding ? 'landing' : 'default'} />
              </li>
            ))}
          </ul>
          {pageData ? (
            <PaginationControls
              page={pageData.page}
              totalPages={pageData.totalPages}
              totalElements={pageData.totalElements}
              disabled={loading}
              onPageChange={goToPage}
              label="Trang danh mục"
            />
          ) : null}
        </>
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

  return <section className="home-catalog-browser">{content}</section>;
}
