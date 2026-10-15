type VideoLessonProps = {
  title: string;
  contentUrl: string | null;
};

export function VideoLesson({ title, contentUrl }: VideoLessonProps) {
  if (!contentUrl) {
    return <p className="muted">This video has no playback URL yet.</p>;
  }

  return (
    <video className="learning-video" controls src={contentUrl} aria-label={title}>
      {title}
    </video>
  );
}
