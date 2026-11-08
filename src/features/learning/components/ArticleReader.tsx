import type { ArticleSnapshot } from '../../catalog/types/article.types';
import { LearningExternalLink } from './LearningExternalLink';

type ArticleReaderProps = {
  lessonTitle: string;
  article: ArticleSnapshot;
  onContentReady?: () => void;
};

export function ArticleReader({ lessonTitle, article, onContentReady }: ArticleReaderProps) {
  const displayTitle = article.extractedTitle?.trim() || lessonTitle;
  const sourceUrl = article.sourceUrl;

  if (article.extractionStatus === 'SUCCESS' && article.contentHtml) {
    if (onContentReady) {
      queueMicrotask(onContentReady);
    }
    return (
      <div className="article-reader">
        <header className="article-reader-header">
          <h2 className="article-reader-title">{displayTitle}</h2>
          <div className="article-reader-meta">
            {article.author ? <p className="article-reader-byline">Tác giả: {article.author}</p> : null}
            {article.publishedAt ? (
              <p className="article-reader-date">
                Xuất bản: {formatArticleDate(article.publishedAt)}
              </p>
            ) : null}
          </div>
          {article.featuredImageUrl ? (
            <img
              className="article-reader-featured-image"
              src={article.featuredImageUrl}
              alt=""
              loading="lazy"
            />
          ) : null}
          {sourceUrl ? (
            <p className="article-reader-source muted">
              Nguồn:{' '}
              <LearningExternalLink href={sourceUrl}>Xem bài gốc</LearningExternalLink>
            </p>
          ) : null}
        </header>
        <div
          className="article-reader-content"
          data-testid="article-reader-content"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      </div>
    );
  }

  return (
    <ArticleReaderFallback
      lessonTitle={lessonTitle}
      sourceUrl={sourceUrl}
      status={article.extractionStatus}
      errorMessage={article.extractionError}
    />
  );
}

type ArticleReaderFallbackProps = {
  lessonTitle: string;
  sourceUrl: string | null;
  status: ArticleSnapshot['extractionStatus'];
  errorMessage?: string | null;
};

export function ArticleReaderFallback({
  lessonTitle,
  sourceUrl,
  status,
  errorMessage,
}: ArticleReaderFallbackProps) {
  if (status === 'PENDING') {
    return <p className="page-status">Đang trích xuất nội dung bài đọc…</p>;
  }

  return (
    <div className="article-reader-fallback">
      <p className="muted">
        {status === 'FAILED'
          ? errorMessage ?? 'Không trích xuất được nội dung bài đọc.'
          : `Chưa có nội dung đọc trong LMS cho “${lessonTitle}”.`}
      </p>
      {sourceUrl && isSafeHttpUrl(sourceUrl) ? (
        <p className="learning-external-fallback">
          <LearningExternalLink href={sourceUrl}>Mở bài đọc bên ngoài</LearningExternalLink>
        </p>
      ) : null}
    </div>
  );
}

function formatArticleDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
}

function isSafeHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}
