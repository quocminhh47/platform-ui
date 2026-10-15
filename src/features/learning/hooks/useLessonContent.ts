import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import type { Lesson } from '../../catalog/types/lesson.types';
import { useAuth } from '../../auth/hooks/useAuth';
import { getLessonContent } from '../api/lessons.api';

export type LessonContentState = {
  lesson: Lesson | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

type UseLessonContentOptions = {
  courseId: string | undefined;
  sectionId: string | undefined;
  lessonId: string | undefined;
};

export function useLessonContent({
  courseId,
  sectionId,
  lessonId,
}: UseLessonContentOptions): LessonContentState {
  const { accessToken } = useAuth();
  const enabled = Boolean(courseId && sectionId && lessonId && accessToken);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [query, setQuery] = useState({
    courseId,
    sectionId,
    lessonId,
    accessToken,
    requestId,
  });

  if (
    query.courseId !== courseId ||
    query.sectionId !== sectionId ||
    query.lessonId !== lessonId ||
    query.accessToken !== accessToken ||
    query.requestId !== requestId
  ) {
    setQuery({ courseId, sectionId, lessonId, accessToken, requestId });
    setLesson(null);
    setError(null);
    setLoading(enabled);
  }

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !courseId || !sectionId || !lessonId || !accessToken) {
      return;
    }

    let active = true;

    getLessonContent(courseId, sectionId, lessonId, accessToken)
      .then((result) => {
        if (!active) {
          return;
        }
        setLesson(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setLesson(null);
        setError(lessonContentMessage(cause));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled, courseId, sectionId, lessonId, accessToken, requestId]);

  return { lesson, loading, error, reload };
}

export function lessonContentMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Your session has expired. Sign in again.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'You need an active enrollment to view this lesson.';
  }
  if (cause instanceof ApiError && cause.status === 404) {
    return 'This lesson is not available.';
  }
  if (cause instanceof ApiError) {
    return 'This lesson could not be loaded. Try again in a moment.';
  }
  return 'Unable to reach the server. Check your connection and try again.';
}
