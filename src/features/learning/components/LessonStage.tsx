import { useCallback, useEffect, useRef } from 'react';
import type { Lesson } from '../../catalog/types/lesson.types';
import { ArticleLesson } from './ArticleLesson';
import { QuizPlayer } from './QuizPlayer';
import { UnsupportedLesson } from './UnsupportedLesson';
import { VideoLesson } from './VideoLesson';

type LessonStageProps = {
  courseId: string | undefined;
  lesson: Lesson | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  missingSelection: boolean;
  isCompleted: boolean;
  autoCompleteEnabled: boolean;
  onAutoComplete: () => void;
  completeError: string | null;
};

export function LessonStage({
  courseId,
  lesson,
  loading,
  error,
  onRetry,
  missingSelection,
  isCompleted,
  autoCompleteEnabled,
  onAutoComplete,
  completeError,
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

      {!loading && !error && lesson ? (
        <LessonBody
          courseId={courseId}
          lesson={lesson}
          isCompleted={isCompleted}
          autoCompleteEnabled={autoCompleteEnabled}
          onAutoComplete={onAutoComplete}
          completeError={completeError}
        />
      ) : null}
    </main>
  );
}

type LessonBodyProps = {
  courseId: string | undefined;
  lesson: Lesson;
  isCompleted: boolean;
  autoCompleteEnabled: boolean;
  onAutoComplete: () => void;
  completeError: string | null;
};

function LessonBody({
  courseId,
  lesson,
  isCompleted,
  autoCompleteEnabled,
  onAutoComplete,
  completeError,
}: LessonBodyProps) {
  const autoCompleteAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    autoCompleteAttemptRef.current = null;
  }, [lesson.id]);

  useEffect(() => {
    if (completeError) {
      autoCompleteAttemptRef.current = null;
    }
  }, [completeError]);

  const handleContentReady = useCallback(() => {
    if (!autoCompleteEnabled || isCompleted) {
      return;
    }
    if (autoCompleteAttemptRef.current === lesson.id) {
      return;
    }
    autoCompleteAttemptRef.current = lesson.id;
    onAutoComplete();
  }, [autoCompleteEnabled, isCompleted, lesson.id, onAutoComplete]);

  return (
    <article className="learning-lesson">
      <div className="learning-lesson-header">
        <h1>{lesson.title}</h1>
        <p className="learning-lesson-status">
          {isCompleted ? (
            <span className="learning-status-complete">Completed</span>
          ) : (
            <span className="learning-status-incomplete">Not completed</span>
          )}
        </p>
      </div>

      {completeError ? (
        <p className="form-error learning-complete-error" role="alert">
          {completeError}
        </p>
      ) : null}

      {lesson.lessonType === 'VIDEO' ? (
        <VideoLesson
          title={lesson.title}
          contentUrl={lesson.contentUrl}
          onContentReady={handleContentReady}
        />
      ) : null}
      {lesson.lessonType === 'ARTICLE' ? (
        <ArticleLesson
          title={lesson.title}
          contentUrl={lesson.contentUrl}
          onContentReady={handleContentReady}
        />
      ) : null}
      {lesson.lessonType === 'QUIZ' && courseId ? (
        <QuizPlayer courseId={courseId} lessonId={lesson.id} />
      ) : null}
      {lesson.lessonType === 'ASSIGNMENT' ? (
        <UnsupportedLesson lessonType={lesson.lessonType} />
      ) : null}
    </article>
  );
}
