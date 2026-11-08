import { PublicArticleContent } from './PublicArticleContent';

type ArticleEditorPreviewProps = {
  title: string;
  excerpt: string;
  featuredImageUrl: string;
  contentHtml: string;
  authorName?: string | null;
};

export function ArticleEditorPreview({
  title,
  excerpt,
  featuredImageUrl,
  contentHtml,
  authorName,
}: ArticleEditorPreviewProps) {
  const displayTitle = title.trim() || 'Tiêu đề bài viết';
  const excerptText = excerpt.trim() || null;
  const imageUrl = featuredImageUrl.trim() || null;

  return (
    <div className="article-editor-preview" data-testid="article-editor-preview">
      <p className="muted article-editor-preview-label">Xem trước (chưa lưu)</p>
      <article className="article-reader public-article-detail">
        <header className="article-reader-header">
          <h2 className="article-reader-title">{displayTitle}</h2>
          {authorName ? (
            <p className="article-reader-byline muted">Tác giả: {authorName}</p>
          ) : null}
          <p className="article-reader-date muted">Xuất bản: (xem trước)</p>
          {excerptText ? <p className="article-detail-excerpt">{excerptText}</p> : null}
          {imageUrl ? (
            <img className="article-reader-featured-image" src={imageUrl} alt="" loading="lazy" />
          ) : null}
        </header>
        {hasMeaningfulPreview(contentHtml) ? (
          <PublicArticleContent html={contentHtml} />
        ) : (
          <p className="muted">Nội dung trống.</p>
        )}
      </article>
    </div>
  );
}

function hasMeaningfulPreview(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 0;
}
