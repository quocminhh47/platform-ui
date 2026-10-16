import {
  isSafeExternalLink,
  toGoogleDocsPreview,
  toGoogleDrivePreview,
} from '../utils/externalContentUrl';
import { LearningEmbedFrame } from './LearningEmbedFrame';
import { LearningExternalLink } from './LearningExternalLink';

type ArticleLessonProps = {
  title: string;
  contentUrl: string | null;
  onContentReady?: () => void;
};

export function ArticleLesson({ title, contentUrl, onContentReady }: ArticleLessonProps) {
  if (!contentUrl || !isSafeExternalLink(contentUrl)) {
    return <p className="muted">This article has no content yet.</p>;
  }

  const drivePreview = toGoogleDrivePreview(contentUrl);
  const docsPreview = toGoogleDocsPreview(contentUrl);
  const previewSrc = drivePreview ?? docsPreview;
  const linkLabel = drivePreview
    ? 'Open in Google Drive'
    : docsPreview
      ? 'Open in Google Docs'
      : 'Open article externally';

  if (previewSrc) {
    return (
      <div className="learning-article">
        <LearningEmbedFrame
          title={title}
          src={previewSrc}
          variant="document"
          onLoad={onContentReady}
        />
        <p className="muted learning-preview-note">
          Preview may not work for every file type (for example some DOC or DOCX uploads). If the
          preview is blank, use the link below.
        </p>
        <p className="learning-external-fallback learning-external-fallback-secondary">
          <LearningExternalLink href={contentUrl}>{linkLabel}</LearningExternalLink>
        </p>
      </div>
    );
  }

  return (
    <div className="learning-article">
      <p className="muted">
        This article cannot be previewed inside the lesson page. Open it externally to view the
        content.
      </p>
      <p className="learning-external-fallback">
        <LearningExternalLink href={contentUrl}>{linkLabel}</LearningExternalLink>
      </p>
    </div>
  );
}
