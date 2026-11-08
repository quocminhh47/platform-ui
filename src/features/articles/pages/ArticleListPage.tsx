import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MemberPageShell } from '../../../components/layout/MemberPageShell';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { PaginationControls } from '../../../components/common/PaginationControls';
import { breadcrumbArticles, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { UI_COPY } from '../../../ui/ui-copy';
import { useAuth } from '../../auth/hooks/useAuth';
import { ArticleCard } from '../components/ArticleCard';
import { usePublicArticlesPage } from '../hooks/usePublicArticlesPage';

const PAGE_SIZE = 12;

export function ArticleListPage() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);
  const { articles, page: pageData, loading, error, reload } = usePublicArticlesPage({
    page,
    size: PAGE_SIZE,
    sort: 'publishedAt,desc',
  });

  return (
    <MemberPageShell>
    <div className="landing-page landing-catalog-page">
      <header className="landing-catalog-hero">
        <div className="landing-container">
          <Breadcrumb items={[breadcrumbHome(), breadcrumbArticles()]} />
          <div className="my-articles-page-header article-list-page-header">
            <div>
              <h1>Bài viết</h1>
              <p className="muted">Tin tức, hướng dẫn và chia sẻ từ cộng đồng LMS.</p>
            </div>
            {isAuthenticated ? (
              <Link className="button-primary" to="/articles/create">
                Tạo bài viết
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="landing-section" aria-labelledby="article-list-heading">
        <div className="landing-container">
          <h2 id="article-list-heading" className="visually-hidden">
            Danh sách bài viết
          </h2>

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
              <p className="muted">
                {isAuthenticated
                  ? 'Bạn có thể tạo bài viết mới hoặc quản lý bản nháp trong mục Bài viết của tôi.'
                  : 'Hãy quay lại sau.'}
              </p>
              {isAuthenticated ? (
                <p className="article-list-empty-actions">
                  <Link className="button-primary" to="/articles/create">
                    Tạo bài viết
                  </Link>
                  <Link className="button-secondary" to="/my-articles">
                    Bài viết của tôi
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}

          {!loading && !error && articles && articles.length > 0 ? (
            <>
              <ul className="landing-article-grid article-list-grid">
                {articles.map((article) => (
                  <li key={article.id}>
                    <ArticleCard article={article} />
                  </li>
                ))}
              </ul>
              {pageData ? (
                <PaginationControls
                  page={pageData.page}
                  totalPages={pageData.totalPages}
                  totalElements={pageData.totalElements}
                  disabled={loading}
                  onPageChange={setPage}
                  label="Trang bài viết"
                />
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </div>
    </MemberPageShell>
  );
}
