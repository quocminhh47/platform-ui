import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import {
  breadcrumbCourseTitle,
  breadcrumbCourses,
  breadcrumbHome,
} from '../../../navigation/breadcrumb-trail';
import type { Lesson } from '../../catalog/types/lesson.types';
import type { SectionWithLessons } from '../../catalog/hooks/useCourseCurriculum';
import { useCourseCurriculum } from '../../catalog/hooks/useCourseCurriculum';
import { useCourseDetail } from '../../catalog/hooks/useCourseDetail';
import { CurriculumSidebar } from '../components/CurriculumSidebar';
import { LessonNav } from '../components/LessonNav';
import { LessonStage } from '../components/LessonStage';
import { useCourseProgress } from '../hooks/useCourseProgress';
import { useLessonContent } from '../hooks/useLessonContent';

export function LearningWorkspacePage() {
  const { courseId, lessonId } = useParams();
  const detail = useCourseDetail(courseId);
  const curriculum = useCourseCurriculum({
    courseId,
    enabled: Boolean(detail.course),
  });
  const {
    progressByLessonId,
    courseSummary,
    sectionSummaries,
    loading: progressLoading,
    error: progressError,
    reload: reloadProgress,
    markLessonComplete,
    syncLessonCompleted,
    completeError,
    clearCompleteError,
  } = useCourseProgress({
    courseId,
    sections: curriculum.sections,
    enabled: Boolean(detail.course),
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const lessons = flattenLessons(curriculum.sections);
  const selected = resolveSelected(lessons, lessonId);
  const selectedIndex = selected ? lessons.findIndex((lesson) => lesson.id === selected.id) : -1;
  const content = useLessonContent({
    courseId: selected ? courseId : undefined,
    sectionId: selected?.sectionId,
    lessonId: selected?.id,
  });

  const isQuizLesson = selected?.lessonType === 'QUIZ';
  const selectedCompleted = selected
    ? (progressByLessonId.get(selected.id)?.isCompleted ?? false)
    : false;
  const autoCompleteEnabled =
    selected !== undefined &&
    !selectedCompleted &&
    (selected.lessonType === 'VIDEO' || selected.lessonType === 'ARTICLE') &&
    !content.loading &&
    !content.error &&
    content.lesson !== null;

  const handleAutoComplete = useCallback(() => {
    if (!selected || selectedCompleted) {
      return;
    }
    void markLessonComplete(selected.id);
  }, [markLessonComplete, selected, selectedCompleted]);

  const handleQuizPassed = useCallback(() => {
    if (!selected || selected.lessonType !== 'QUIZ') {
      return;
    }
    syncLessonCompleted(selected.id);
  }, [selected, syncLessonCompleted]);

  useEffect(() => {
    clearCompleteError();
  }, [selected?.id, clearCompleteError]);

  let workspace: ReactNode;

  if (detail.loading) {
    workspace = <p className="page-status learning-page-status">Loading course…</p>;
  } else if (detail.notFound || !courseId) {
    workspace = (
      <section className="course-detail-empty">
        <h1>Course not available</h1>
        <Link to="/courses">Back to courses</Link>
      </section>
    );
  } else if (detail.error || !detail.course) {
    workspace = (
      <section className="course-detail-empty">
        <h1>Could not load course</h1>
        <div className="section-error" role="alert">
          <p>{detail.error}</p>
          <button type="button" onClick={detail.reload}>
            Try again
          </button>
        </div>
      </section>
    );
  } else {
    workspace = (
      <div className={sidebarCollapsed ? 'learning-shell is-collapsed' : 'learning-shell'}>
        <header className="learning-header">
          <Link to={`/courses/${courseId}`}>{detail.course.title}</Link>
        </header>
        <div className="learning-body">
          <CurriculumSidebar
            courseId={courseId}
            sections={curriculum.sections}
            loading={curriculum.loading}
            error={curriculum.error}
            onRetry={curriculum.reload}
            selectedLessonId={selected?.id}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
            progressLoading={progressLoading}
            progressError={progressError}
            onRetryProgress={reloadProgress}
            courseSummary={courseSummary}
            sectionSummaries={sectionSummaries}
            isLessonCompleted={(id) => progressByLessonId.get(id)?.isCompleted ?? false}
          />
          <div className="learning-stage-column">
            <LessonStage
              courseId={courseId}
              lesson={isQuizLesson ? (content.lesson ?? selected ?? null) : content.lesson}
              loading={curriculum.loading || (!isQuizLesson && content.loading)}
              error={isQuizLesson ? null : content.error}
              onRetry={isQuizLesson ? curriculum.reload : content.reload}
              missingSelection={Boolean(lessonId) && !curriculum.loading && !selected}
              isCompleted={selectedCompleted}
              autoCompleteEnabled={autoCompleteEnabled}
              onAutoComplete={handleAutoComplete}
              completeError={completeError}
              onQuizPassed={handleQuizPassed}
            />
            <LessonNav
              courseId={courseId}
              previous={selectedIndex > 0 ? lessons[selectedIndex - 1] : null}
              next={
                selectedIndex >= 0 && selectedIndex < lessons.length - 1
                  ? lessons[selectedIndex + 1]
                  : null
              }
            />
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = courseId
    ? [
        breadcrumbHome(),
        breadcrumbCourses(),
        breadcrumbCourseTitle(courseId, detail.course?.title, detail.loading),
        { label: selected?.title?.trim() || 'Không gian học' },
      ]
    : [breadcrumbHome(), breadcrumbCourses(), { label: 'Không gian học' }];

  return (
    <div className="learning-page">
      <div className="learning-breadcrumb-bar landing-container">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {workspace}
    </div>
  );
}

function flattenLessons(sections: SectionWithLessons[] | null): Lesson[] {
  if (!sections) {
    return [];
  }
  return sections.flatMap((section) => section.lessons);
}

function resolveSelected(lessons: Lesson[], lessonId: string | undefined): Lesson | undefined {
  if (lessons.length === 0) {
    return undefined;
  }
  if (!lessonId) {
    return lessons[0];
  }
  return lessons.find((lesson) => lesson.id === lessonId);
}
