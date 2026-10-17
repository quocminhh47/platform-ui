import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { listCourseSections } from '../api/admin-sections.api';
import { listSectionLessons } from '../api/admin-lessons.api';
import type { Lesson } from '../../catalog/types/lesson.types';
import type { Section } from '../../catalog/types/section.types';
import { adminCurriculumLoadMessage } from '../utils/admin-curriculum-messages';
import { sortBySortOrder } from '../utils/sort-by-sort-order';

export type SectionWithLessons = Section & {
  lessons: Lesson[];
};

export type AdminCurriculumState = {
  sections: SectionWithLessons[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  refresh: () => Promise<SectionWithLessons[]>;
};

async function loadCurriculum(
  accessToken: string,
  courseId: string,
): Promise<SectionWithLessons[]> {
  const sectionList = sortBySortOrder(await listCourseSections(accessToken, courseId));
  return Promise.all(
    sectionList.map(async (section) => {
      const lessons = sortBySortOrder(
        await listSectionLessons(accessToken, courseId, section.id),
      );
      return { ...section, lessons };
    }),
  );
}

export function useAdminCurriculum(
  courseId: string | undefined,
  enabled: boolean,
): AdminCurriculumState {
  const { accessToken } = useAuth();
  const [sections, setSections] = useState<SectionWithLessons[] | null>(null);
  const [loading, setLoading] = useState(enabled && Boolean(courseId));
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

  const refresh = useCallback(async () => {
    if (!accessToken || !courseId) {
      setSections(null);
      return [];
    }
    const result = await loadCurriculum(accessToken, courseId);
    setSections(result);
    setError(null);
    setLoading(false);
    return result;
  }, [accessToken, courseId]);

  useEffect(() => {
    if (!enabled || !courseId || !accessToken) {
      return;
    }

    let active = true;

    loadCurriculum(accessToken, courseId)
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
        setError(adminCurriculumLoadMessage(cause));
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

  return { sections, loading, error, reload, refresh };
}
