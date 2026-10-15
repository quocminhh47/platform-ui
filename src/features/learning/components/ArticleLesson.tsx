type ArticleLessonProps = {
  title: string;
  contentUrl: string | null;
};

export function ArticleLesson({ title, contentUrl }: ArticleLessonProps) {
  if (!contentUrl || !isHttpUrl(contentUrl)) {
    return <p className="muted">This article has no content yet.</p>;
  }

  return (
    <div className="learning-article">
      <p>
        <a href={contentUrl} rel="noreferrer">
          Open article
        </a>
      </p>
      <iframe title={title} src={contentUrl} sandbox="" />
    </div>
  );
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
