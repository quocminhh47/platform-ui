import type { Lesson } from '../../catalog/types/lesson.types';
import { ArticleLesson } from './ArticleLesson';
import { UnsupportedLesson } from './UnsupportedLesson';
import { VideoLesson } from './VideoLesson';

type LessonStageProps = {
  lesson: Lesson | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  missingSelection: boolean;
};

export function LessonStage({
  lesson,
  loading,
  error,
  onRetry,
  missingSelection,
}: LessonStageProps) {
  return (
    <main className="learning-stage" aria-label="Lesson">
      {loading ? <p className="page-status">Loading lesson…</p> : null}

      {!loading && error ? (
        <div className="section-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : null}

      {!loading && !error && missingSelection ? (
        <p className="muted">This lesson is not in the course curriculum.</p>
      ) : null}

      {!loading && !error && lesson ? <LessonBody lesson={lesson} /> : null}
    </main>
  );
}

function LessonBody({ lesson }: { lesson: Lesson }) {
  return (
    <article className="learning-lesson">
      <h1>{lesson.title}</h1>
      {lesson.lessonType === 'VIDEO' ? (
        <VideoLesson title={lesson.title} contentUrl={lesson.contentUrl} />
      ) : null}
      {lesson.lessonType === 'ARTICLE' ? (
        <ArticleLesson title={lesson.title} contentUrl={lesson.contentUrl} />
      ) : null}
      {lesson.lessonType === 'QUIZ' || lesson.lessonType === 'ASSIGNMENT' ? (
        <UnsupportedLesson lessonType={lesson.lessonType} />
      ) : null}
    </article>
  );
}
