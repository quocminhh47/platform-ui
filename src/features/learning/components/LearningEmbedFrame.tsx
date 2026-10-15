import { isAllowedEmbedIframeSrc } from '../utils/externalContentUrl';

/**
 * Google Drive/Docs previews need scripts and same-origin; an empty sandbox blocks
 * them. YouTube embeds are origin-isolated on youtube-nocookie.com. We omit
 * allow-top-navigation to reduce escape risk.
 */
const GOOGLE_PREVIEW_SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-forms';
const YOUTUBE_SANDBOX =
  'allow-scripts allow-same-origin allow-popups allow-presentation allow-forms';

type LearningEmbedFrameProps = {
  title: string;
  src: string;
  variant: 'video' | 'document';
};

export function LearningEmbedFrame({ title, src, variant }: LearningEmbedFrameProps) {
  if (!isAllowedEmbedIframeSrc(src)) {
    return null;
  }

  const sandbox = variant === 'video' ? YOUTUBE_SANDBOX : GOOGLE_PREVIEW_SANDBOX;

  return (
    <div className={variant === 'video' ? 'learning-embed learning-embed-video' : 'learning-embed learning-embed-document'}>
      <iframe title={title} src={src} sandbox={sandbox} allowFullScreen={variant === 'video'} />
    </div>
  );
}
