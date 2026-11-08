import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../services/api/api-error';
import type { SectionWithLessons } from '../../catalog/hooks/useCourseCurriculum';
import { useAuth } from '../../auth/hooks/useAuth';
import { completeLessonProgress, listCourseProgress } from '../api/progress.api';
import type { CourseProgressSummary, LessonProgress, LessonProgressView } from '../types/progress.types';
import {
  mergeCourseProgress,
  summarizeCourseProgress,
  summarizeSectionProgress,
  upsertProgressRow,
} from '../utils/courseProgressMap';

export type CourseProgressState = {
  progressByLessonId: Map<string, LessonProgressView>;
  courseSummary: CourseProgressSummary;
  sectionSummaries: Map<string, { completedCount: number; totalCount: number }>;
  loading: boolean;
  error: string | null;
  reload: () => void;
  markLessonComplete: (lessonId: string) => Promise<void>;
  syncLessonCompleted: (lessonId: string) => void;
  completingLessonId: string | null;
  completeError: string | null;
  clearCompleteError: () => void;
};

type UseCourseProgressOptions = {
  courseId: string | undefined;
  sections: SectionWithLessons[] | null;
  enabled: boolean;
};

export function useCourseProgress({
  courseId,
  sections,
  enabled,
}: UseCourseProgressOptions): CourseProgressState {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState<LessonProgress[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const [completingLessonId, setCompletingLessonId] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const fetchEnabled = enabled && Boolean(courseId && accessToken);
  const [query, setQuery] = useState({
    courseId,
    accessToken,
    requestId,
    fetchEnabled,
  });

  if (
    query.courseId !== courseId ||
    query.accessToken !== accessToken ||
    query.requestId !== requestId ||
    query.fetchEnabled !== fetchEnabled
  ) {
    setQuery({ courseId, accessToken, requestId, fetchEnabled });
    setRows(null);
    setError(null);
    setLoading(fetchEnabled);
  }

  const reload = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  const clearCompleteError = useCallback(() => {
    setCompleteError(null);
  }, []);

  useEffect(() => {
    if (!fetchEnabled || !courseId || !accessToken) {
      return;
    }

    let active = true;

    listCourseProgress(courseId, accessToken)
      .then((result) => {
        if (!active) {
          return;
        }
        setRows(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }
        setRows([]);
        setError(progressLoadMessage(cause));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetchEnabled, courseId, accessToken, requestId]);

  const progressByLessonId = useMemo(
    () => mergeCourseProgress(sections, rows ?? []),
    [sections, rows],
  );

  const courseSummary = useMemo(
    () => summarizeCourseProgress(sections, progressByLessonId),
    [sections, progressByLessonId],
  );

  const sectionSummaries = useMemo(() => {
    const map = new Map<string, { completedCount: number; totalCount: number }>();
    if (!sections) {
      return map;
    }
    for (const section of sections) {
      const summary = summarizeSectionProgress(section, progressByLessonId);
      map.set(section.id, {
        completedCount: summary.completedCount,
        totalCount: summary.totalCount,
      });
    }
    return map;
  }, [sections, progressByLessonId]);

  const syncLessonCompleted = useCallback((lessonId: string) => {
    setRows((current) =>
      upsertProgressRow(current ?? [], {
        lessonId,
        isCompleted: true,
        watchedDurationSeconds: 0,
        lastAccessedAt: new Date().toISOString(),
      }),
    );
  }, []);

  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      if (!courseId || !accessToken || completingLessonId) {
        return;
      }
      if (progressByLessonId.get(lessonId)?.isCompleted) {
        return;
      }
      setCompletingLessonId(lessonId);
      setCompleteError(null);
      try {
        const updated = await completeLessonProgress(courseId, lessonId, accessToken);
        setRows((current) => upsertProgressRow(current ?? [], updated));
      } catch (cause: unknown) {
        setCompleteError(completeProgressMessage(cause));
      } finally {
        setCompletingLessonId(null);
      }
    },
    [accessToken, completingLessonId, courseId, progressByLessonId],
  );

  return {
    progressByLessonId,
    courseSummary,
    sectionSummaries,
    loading,
    error,
    reload,
    markLessonComplete,
    syncLessonCompleted,
    completingLessonId,
    completeError,
    clearCompleteError,
  };
}

function progressLoadMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Tiến độ khả dụng sau khi bạn ghi danh vào khóa học này.';
  }
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError) {
    return 'Không tải được tiến độ khóa học. Vui lòng thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

function completeProgressMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 400) {
    return 'Bài học này chưa thể đánh dấu hoàn thành.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn cần ghi danh hoạt động để cập nhật tiến độ.';
  }
  if (cause instanceof ApiError) {
    return 'Không đánh dấu hoàn thành được. Vui lòng thử lại.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}
