import {
  isDirectVideoMediaUrl,
  isSafeExternalLink,
  toYouTubeNocookieEmbed,
} from '../utils/externalContentUrl';
import { LearningEmbedFrame } from './LearningEmbedFrame';
import { LearningExternalLink } from './LearningExternalLink';

type VideoLessonProps = {
  title: string;
  contentUrl: string | null;
};

export function VideoLesson({ title, contentUrl }: VideoLessonProps) {
  if (!contentUrl) {
    return <p className="muted">This video has no playback URL yet.</p>;
  }

  const youtubeEmbed = toYouTubeNocookieEmbed(contentUrl);
  if (youtubeEmbed) {
    return (
      <div className="learning-video-shell">
        <LearningEmbedFrame title={title} src={youtubeEmbed} variant="video" />
      </div>
    );
  }

  if (isDirectVideoMediaUrl(contentUrl)) {
    return (
      <video className="learning-video" controls src={contentUrl} aria-label={title}>
        {title}
      </video>
    );
  }

  if (isSafeExternalLink(contentUrl)) {
    return (
      <div className="learning-video-shell">
        <p className="muted">This video cannot be played inside the lesson page.</p>
        <p className="learning-external-fallback">
          <LearningExternalLink href={contentUrl}>Open video externally</LearningExternalLink>
        </p>
      </div>
    );
  }

  return <p className="muted">This video has no valid playback URL.</p>;
}
