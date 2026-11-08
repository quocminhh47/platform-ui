/**
 * Renders server-sanitized article HTML (same convention as learning {@link ArticleReader}).
 */
type PublicArticleContentProps = {
  html: string;
};

export function PublicArticleContent({ html }: PublicArticleContentProps) {
  return (
    <div
      className="article-reader-content"
      data-testid="public-article-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
