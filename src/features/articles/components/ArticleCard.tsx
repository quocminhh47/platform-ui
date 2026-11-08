import { Link } from 'react-router-dom';
import type { PublicArticleSummary } from '../types/article.types';
import { formatArticleDate } from '../utils/formatArticleDate';

type ArticleCardProps = {
  article: PublicArticleSummary;
  variant?: 'landing' | 'list';
};

export function ArticleCard({ article, variant = 'list' }: ArticleCardProps) {
  const publishedLabel = formatArticleDate(article.publishedAt);
  const excerpt = article.excerpt?.trim() || null;
  const linkClass = variant === 'landing' ? 'landing-article-link' : 'article-card-link';
  const cardClass = variant === 'landing' ? 'landing-article-card' : 'article-card';

  return (
    <Link className={linkClass} to={`/articles/${article.slug}`}>
      <article className={cardClass}>
        <div className="article-card-media">
          {article.featuredImageUrl ? (
            <img
              src={article.featuredImageUrl}
              alt=""
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="article-card-media-fallback" aria-hidden="true">
              <span className="article-card-media-mark">Bài viết</span>
            </div>
          )}
        </div>
        <div className="article-card-body">
          <h3 title={article.title}>{article.title}</h3>
          {excerpt ? <p className="article-card-excerpt">{excerpt}</p> : null}
          <p className="article-card-meta muted">
            {article.authorName ? <span>Tác giả: {article.authorName}</span> : null}
            {publishedLabel ? <span>Xuất bản: {publishedLabel}</span> : null}
          </p>
        </div>
      </article>
    </Link>
  );
}
