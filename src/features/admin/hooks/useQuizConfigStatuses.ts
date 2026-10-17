import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { getQuiz } from '../api/admin-quiz.api';

export type QuizConfigStatus = 'loading' | 'configured' | 'unconfigured' | 'error';

export function useQuizConfigStatuses(
  courseId: string | undefined,
  lessonIds: string[],
  accessToken: string | null,
  enabled: boolean,
): Record<string, QuizConfigStatus> {
  const stableIds = useMemo(
    () => [...lessonIds].sort().join(','),
    [lessonIds],
  );
  const [statuses, setStatuses] = useState<Record<string, QuizConfigStatus>>({});

  useEffect(() => {
    if (!enabled || !courseId || !accessToken || lessonIds.length === 0) {
      setStatuses({});
      return;
    }

    let active = true;
    const next: Record<string, QuizConfigStatus> = {};
    for (const id of lessonIds) {
      next[id] = 'loading';
    }
    setStatuses(next);

    Promise.all(
      lessonIds.map(async (lessonId) => {
        try {
          await getQuiz(accessToken, courseId, lessonId);
          return { lessonId, status: 'configured' as const };
        } catch (cause: unknown) {
          if (cause instanceof ApiError && cause.status === 404) {
            return { lessonId, status: 'unconfigured' as const };
          }
          return { lessonId, status: 'error' as const };
        }
      }),
    ).then((results) => {
      if (!active) {
        return;
      }
      const map: Record<string, QuizConfigStatus> = {};
      for (const row of results) {
        map[row.lessonId] = row.status;
      }
      setStatuses(map);
    });

    return () => {
      active = false;
    };
  }, [courseId, accessToken, enabled, stableIds, lessonIds]);

  return statuses;
}
