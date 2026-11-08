import type { ArticleSnapshot } from '../../catalog/types/article.types';
import {
  isSafeExternalLink,
  toGoogleDocsPreview,
  toGoogleDrivePreview,
} from '../utils/externalContentUrl';
import { ArticleReader, ArticleReaderFallback } from './ArticleReader';
import { LearningEmbedFrame } from './LearningEmbedFrame';
import { LearningExternalLink } from './LearningExternalLink';

type ArticleLessonProps = {
  title: string;
  contentUrl: string | null;
  article?: ArticleSnapshot | null;
  onContentReady?: () => void;
};

export function ArticleLesson({ title, contentUrl, article, onContentReady }: ArticleLessonProps) {
  if (article?.extractionStatus === 'SUCCESS' && article.contentHtml) {
    return <ArticleReader lessonTitle={title} article={article} onContentReady={onContentReady} />;
  }

  if (article && (article.extractionStatus === 'PENDING' || article.extractionStatus === 'FAILED')) {
    if (isGoogleWorkspaceUrl(contentUrl)) {
      return (
        <GoogleWorkspaceArticle
          title={title}
          contentUrl={contentUrl}
          onContentReady={onContentReady}
        />
      );
    }
    return (
      <ArticleReaderFallback
        lessonTitle={title}
        sourceUrl={article.sourceUrl ?? contentUrl}
        status={article.extractionStatus}
        errorMessage={article.extractionError}
      />
    );
  }

  if (!contentUrl || !isSafeExternalLink(contentUrl)) {
    return <p className="muted">Bài đọc chưa có nội dung.</p>;
  }

  const drivePreview = toGoogleDrivePreview(contentUrl);
  const docsPreview = toGoogleDocsPreview(contentUrl);
  const previewSrc = drivePreview ?? docsPreview;

  if (previewSrc) {
    return (
      <GoogleWorkspaceArticle
        title={title}
        contentUrl={contentUrl}
        previewSrc={previewSrc}
        onContentReady={onContentReady}
      />
    );
  }

  if (article) {
    return (
      <ArticleReaderFallback
        lessonTitle={title}
        sourceUrl={article.sourceUrl ?? contentUrl}
        status={article.extractionStatus}
        errorMessage={article.extractionError}
      />
    );
  }

  return (
    <ArticleReaderFallback
      lessonTitle={title}
      sourceUrl={contentUrl}
      status={null}
      errorMessage={null}
    />
  );
}

function isGoogleWorkspaceUrl(contentUrl: string | null): boolean {
  if (!contentUrl) {
    return false;
  }
  return Boolean(toGoogleDrivePreview(contentUrl) ?? toGoogleDocsPreview(contentUrl));
}

function GoogleWorkspaceArticle({
  title,
  contentUrl,
  previewSrc,
  onContentReady,
}: {
  title: string;
  contentUrl: string | null;
  previewSrc?: string | null;
  onContentReady?: () => void;
}) {
  if (!contentUrl) {
    return null;
  }
  const drivePreview = previewSrc ?? toGoogleDrivePreview(contentUrl);
  const docsPreview = drivePreview ? null : toGoogleDocsPreview(contentUrl);
  const resolvedPreview = drivePreview ?? docsPreview;
  const linkLabel = drivePreview
    ? 'Mở trên Google Drive'
    : docsPreview
      ? 'Mở trên Google Docs'
      : 'Mở bài đọc bên ngoài';

  if (!resolvedPreview) {
    return (
      <ArticleReaderFallback lessonTitle={title} sourceUrl={contentUrl} status={null} errorMessage={null} />
    );
  }

  return (
    <div className="learning-article">
      <LearningEmbedFrame
        title={title}
        src={resolvedPreview}
        variant="document"
        onLoad={onContentReady}
      />
      <p className="muted learning-preview-note">
        Xem trước có thể không hoạt động với mọi định dạng (vd. một số tệp DOC/DOCX). Nếu trống,
        hãy dùng liên kết bên dưới.
      </p>
      <p className="learning-external-fallback learning-external-fallback-secondary">
        <LearningExternalLink href={contentUrl}>{linkLabel}</LearningExternalLink>
      </p>
    </div>
  );
}
