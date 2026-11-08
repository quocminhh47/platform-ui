import { Link } from 'react-router-dom';
import { SectionHeading } from '../common/SectionHeading';
import { ArticleCard } from '../../features/articles/components/ArticleCard';
import { usePublicArticlesPage } from '../../features/articles/hooks/usePublicArticlesPage';
import { UI_COPY } from '../../ui/ui-copy';

const LATEST_LIMIT = 4;

export function LatestArticlesSection() {
  const { articles, loading, error, reload } = usePublicArticlesPage({
    page: 0,
    size: LATEST_LIMIT,
    sort: 'publishedAt,desc',
  });

  const visible = articles?.slice(0, LATEST_LIMIT) ?? null;

  return (
    <section
      className="landing-section landing-articles"
      id="articles"
      aria-labelledby="latest-articles-heading"
    >
      <div className="landing-container">
        <SectionHeading
          id="latest-articles-heading"
          eyebrow="Tin tức & chia sẻ"
          title="Bài viết mới nhất"
          action={
            <Link className="landing-text-link" to="/articles">
              Xem tất cả bài viết
            </Link>
          }
        />

        {loading ? <p className="page-status">Đang tải bài viết…</p> : null}

        {!loading && error ? (
          <div className="section-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={reload}>
              {UI_COPY.tryAgain}
            </button>
          </div>
        ) : null}

        {!loading && !error && articles && articles.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Chưa có bài viết đã xuất bản</p>
            <p className="muted">Các bài viết mới sẽ hiển thị tại đây khi được xuất bản.</p>
          </div>
        ) : null}

        {!loading && !error && visible && visible.length > 0 ? (
          <ul className="landing-article-grid">
            {visible.map((article) => (
              <li key={article.id}>
                <ArticleCard article={article} variant="landing" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
