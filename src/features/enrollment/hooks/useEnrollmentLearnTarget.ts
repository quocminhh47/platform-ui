import { useEffect, useState } from 'react';
import { listCourseSections, listSectionLessons } from '../../catalog/api/courses.api';
import type { SectionWithLessons } from '../../catalog/hooks/useCourseCurriculum';
import { listCourseProgress } from '../../learning/api/progress.api';
import {
  buildLearningPath,
  flattenCurriculumLessons,
  learnCtaLabel,
  pickResumeLessonId,
} from '../../learning/utils/learningNavigation';
import type { Enrollment } from '../api/enrollments.api';

export type EnrollmentLearnTarget = {
  path: string;
  label: 'Bắt đầu học' | 'Tiếp tục học';
  loading: boolean;
  error: string | null;
  noLessons: boolean;
};

function canLearn(status: Enrollment['status']): boolean {
  return status === 'ACTIVE' || status === 'COMPLETED';
}

export function useEnrollmentLearnTarget(
  enrollment: Enrollment,
  accessToken: string | null,
): EnrollmentLearnTarget {
  const enabled = canLearn(enrollment.status) && Boolean(accessToken);
  const [state, setState] = useState<EnrollmentLearnTarget>(() => ({
    path: buildLearningPath(enrollment.courseId),
    label: 'Bắt đầu học',
    loading: enabled,
    error: null,
    noLessons: false,
  }));
  const [query, setQuery] = useState({
    courseId: enrollment.courseId,
    status: enrollment.status,
    accessToken,
  });

  if (
    query.courseId !== enrollment.courseId ||
    query.status !== enrollment.status ||
    query.accessToken !== accessToken
  ) {
    setQuery({ courseId: enrollment.courseId, status: enrollment.status, accessToken });
    if (!enabled) {
      setState({
        path: buildLearningPath(enrollment.courseId),
        label: 'Bắt đầu học',
        loading: false,
        error: null,
        noLessons: false,
      });
    } else {
      setState({
        path: buildLearningPath(enrollment.courseId),
        label: 'Bắt đầu học',
        loading: true,
        error: null,
        noLessons: false,
      });
    }
  }

  useEffect(() => {
    if (!enabled || !accessToken) {
      return;
    }

    const token = accessToken;
    let active = true;

    async function load() {
      const sections = await listCourseSections(enrollment.courseId, token);
      const withLessons: SectionWithLessons[] = await Promise.all(
        sections.map(async (section) => {
          const lessons = await listSectionLessons(enrollment.courseId, section.id, token);
          return { ...section, lessons };
        }),
      );
      const progressRows = await listCourseProgress(enrollment.courseId, token);
      const lessons = flattenCurriculumLessons(withLessons);
      const lessonId = pickResumeLessonId(lessons, progressRows);

      if (!active) {
        return;
      }
      setState({
        path: buildLearningPath(enrollment.courseId, lessonId),
        label: learnCtaLabel(lessons, progressRows),
        loading: false,
        error: null,
        noLessons: lessons.length === 0,
      });
    }

    load().catch(() => {
      if (!active) {
        return;
      }
      setState({
        path: buildLearningPath(enrollment.courseId),
        label: 'Tiếp tục học',
        loading: false,
        error: 'Không thể xác định bài học. Mở không gian học tập.',
        noLessons: false,
      });
    });

    return () => {
      active = false;
    };
  }, [enabled, accessToken, enrollment.courseId]);

  return state;
}
