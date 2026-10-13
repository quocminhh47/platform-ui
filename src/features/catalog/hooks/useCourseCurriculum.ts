import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import { useAuth } from '../../auth/hooks/useAuth';
import { listCourseSections, listSectionLessons } from '../api/courses.api';
import type { Lesson } from '../types/lesson.types';
import type { Section } from '../types/section.types';

export type SectionWithLessons = Section & {
  lessons: Lesson[];
};

export type CourseCurriculumState = {
  sections: SectionWithLessons[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

type UseCourseCurriculumOptions = {
  courseId: string | undefined;
  /** When false, no request is made (e.g. course overview still loading or not found). */
  enabled: boolean;
};

export function useCourseCurriculum({
  courseId,
  enabled,
}: UseCourseCurriculumOptions): CourseCurriculumState {
  const { accessToken } = useAuth();
  const [sections, setSections] = useState<SectionWithLessons[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [query, setQuery] = useState({ courseId, accessToken, enabled, requestId });

  if (
    query.courseId !== courseId ||
    query.accessToken !== accessToken ||
    query.enabled !== enabled ||
    query.requestId !== requestId
  ) {
    setQuery({ courseId, accessToken, enabled, requestId });
    setLoading(enabled && Boolean(courseId));
    setError(null);
    if (!enabled) {
      setSections(null);
    }
  }

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !courseId) {
      return;
    }

    let active = true;

    listCourseSections(courseId, accessToken)
      .then(async (sectionList) => {
        const withLessons = await Promise.all(
          sectionList.map(async (section) => {
            const lessons = await listSectionLessons(courseId, section.id, accessToken);
            return { ...section, lessons };
          }),
        );
        return withLessons;
      })
      .then((result) => {
        if (!active) {
          return;
        }
        setSections(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setSections(null);
        setError(
          cause instanceof ApiError
            ? 'The curriculum could not be loaded. Try again in a moment.'
            : 'Unable to reach the server. Check your connection and try again.',
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [courseId, accessToken, enabled, requestId]);

  return { sections, loading, error, reload };
}
