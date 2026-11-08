import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MemberPageShell } from '../../../components/layout/MemberPageShell';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { ApiError } from '../../../services/api/api-error';
import { breadcrumbArticles, breadcrumbArticleTitle, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { UI_COPY } from '../../../ui/ui-copy';
import { getPublicArticleBySlug } from '../api/public-articles.api';
import { PublicArticleContent } from '../components/PublicArticleContent';
import type { PublicArticleDetail } from '../types/article.types';
import { formatArticleDate } from '../utils/formatArticleDate';

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<PublicArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug?.trim()) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setArticle(null);

    getPublicArticleBySlug(slug)
      .then((result) => {
        if (!active) {
          return;
        }
        setArticle(result);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        if (cause instanceof ApiError && cause.status === 404) {
          setNotFound(true);
          return;
        }
        setError(
          cause instanceof ApiError
            ? 'Không tải được bài viết. Vui lòng thử lại sau.'
            : 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.',
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const publishedLabel = formatArticleDate(article?.publishedAt);
  const excerpt = article?.excerpt?.trim() || null;

  const breadcrumbTitle = loading
    ? 'Đang tải…'
    : notFound
      ? 'Không tìm thấy'
      : article?.title ?? 'Bài viết';

  return (
    <MemberPageShell>
    <div className="landing-page article-detail-page">
      <header className="landing-catalog-hero article-detail-hero">
        <div className="landing-container">
          <Breadcrumb
            items={[
              breadcrumbHome(),
              breadcrumbArticles(),
              breadcrumbArticleTitle(breadcrumbTitle),
            ]}
          />
        </div>
      </header>

      <div className="landing-container article-detail-container">
        <p className="article-detail-back">
          <Link className="landing-text-link" to="/articles">
            ← Quay lại danh sách bài viết
          </Link>
        </p>

        {loading ? <p className="page-status">Đang tải bài viết…</p> : null}

        {!loading && notFound ? (
          <div className="empty-state" role="alert">
            <p className="empty-state-title">Không tìm thấy bài viết</p>
            <p className="muted">Bài viết có thể đã được gỡ hoặc chưa được xuất bản.</p>
            <p>
              <Link className="landing-btn landing-btn-outline" to="/articles">
                Xem tất cả bài viết
              </Link>
            </p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="section-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              {UI_COPY.tryAgain}
            </button>
          </div>
        ) : null}

        {!loading && article ? (
          <article className="article-reader public-article-detail">
            <header className="article-reader-header">
              <h1 className="article-reader-title">{article.title}</h1>
              <div className="article-reader-meta">
                {article.authorName ? (
                  <p className="article-reader-byline">Tác giả: {article.authorName}</p>
                ) : null}
                {publishedLabel ? (
                  <p className="article-reader-date">Xuất bản: {publishedLabel}</p>
                ) : null}
              </div>
              {excerpt ? <p className="article-detail-excerpt">{excerpt}</p> : null}
              {article.featuredImageUrl ? (
                <img
                  className="article-reader-featured-image"
                  src={article.featuredImageUrl}
                  alt=""
                  loading="eager"
                />
              ) : null}
            </header>
            <PublicArticleContent html={article.contentHtml} />
          </article>
        ) : null}
      </div>
    </div>
    </MemberPageShell>
  );
}
