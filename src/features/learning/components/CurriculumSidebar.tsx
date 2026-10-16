import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SectionWithLessons } from '../../catalog/hooks/useCourseCurriculum';
import type { CourseProgressSummary } from '../types/progress.types';

type CurriculumSidebarProps = {
  courseId: string;
  sections: SectionWithLessons[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedLessonId: string | undefined;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  progressLoading: boolean;
  progressError: string | null;
  onRetryProgress: () => void;
  courseSummary: CourseProgressSummary;
  sectionSummaries: Map<string, { completedCount: number; totalCount: number }>;
  isLessonCompleted: (lessonId: string) => boolean;
};

export function CurriculumSidebar({
  courseId,
  sections,
  loading,
  error,
  onRetry,
  selectedLessonId,
  collapsed,
  onToggleCollapsed,
  progressLoading,
  progressError,
  onRetryProgress,
  courseSummary,
  sectionSummaries,
  isLessonCompleted,
}: CurriculumSidebarProps) {
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<string[]>([]);
  const selectedSectionId = sections?.find((section) =>
    section.lessons.some((lesson) => lesson.id === selectedLessonId),
  )?.id;
  const [trackedLessonId, setTrackedLessonId] = useState(selectedLessonId);

  if (trackedLessonId !== selectedLessonId) {
    setTrackedLessonId(selectedLessonId);
    if (selectedSectionId && collapsedSectionIds.includes(selectedSectionId)) {
      setCollapsedSectionIds(collapsedSectionIds.filter((id) => id !== selectedSectionId));
    }
  }

  return (
    <aside className="learning-sidebar" aria-label="Curriculum">
      <div className="learning-sidebar-bar">
        {collapsed ? null : <p className="sidebar-label">Curriculum</p>}
        <button
          type="button"
          className="learning-sidebar-toggle"
          aria-expanded={!collapsed}
          aria-controls="learning-curriculum"
          aria-label={collapsed ? 'Expand curriculum' : 'Collapse curriculum'}
          onClick={onToggleCollapsed}
        >
          <ChevronIcon direction={collapsed ? 'right' : 'left'} />
        </button>
      </div>

      <div
        id="learning-curriculum"
        className="learning-sidebar-scroll"
        hidden={collapsed}
      >
        {!collapsed && courseSummary.totalCount > 0 ? (
          <div className="learning-course-progress">
            <div className="learning-course-progress-label">
              <span>Course progress</span>
              <span>{courseSummary.percent}%</span>
            </div>
            <div
              className="learning-course-progress-track"
              role="progressbar"
              aria-valuenow={courseSummary.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${courseSummary.completedCount} of ${courseSummary.totalCount} lessons completed`}
            >
              <div
                className="learning-course-progress-fill"
                style={{ width: `${courseSummary.percent}%` }}
              />
            </div>
            <p className="learning-course-progress-meta muted">
              {courseSummary.completedCount} of {courseSummary.totalCount} lessons completed
            </p>
          </div>
        ) : null}

        {progressLoading ? <p className="page-status">Loading progress…</p> : null}

        {!progressLoading && progressError ? (
          <div className="section-error learning-progress-error" role="alert">
            <p>{progressError}</p>
            <button type="button" onClick={onRetryProgress}>
              Try again
            </button>
          </div>
        ) : null}

        {loading ? <p className="page-status">Loading curriculum…</p> : null}

        {!loading && error ? (
          <div className="section-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={onRetry}>
              Try again
            </button>
          </div>
        ) : null}

        {!loading && !error && sections && sections.length === 0 ? (
          <p className="muted">This course does not have any sections yet.</p>
        ) : null}

        {!loading && !error && sections && sections.length > 0 ? (
          <ol className="learning-sections">
            {sections.map((section) => {
              const expanded = !collapsedSectionIds.includes(section.id);
              const sectionProgress = sectionSummaries.get(section.id);
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    className="learning-section-toggle"
                    aria-expanded={expanded}
                    aria-controls={`learning-section-${section.id}`}
                    onClick={() => {
                      setCollapsedSectionIds((current) =>
                        current.includes(section.id)
                          ? current.filter((id) => id !== section.id)
                          : [...current, section.id],
                      );
                    }}
                  >
                    <ChevronIcon direction={expanded ? 'down' : 'right'} />
                    <span className="learning-section-toggle-text">
                      <span>{section.title}</span>
                      {sectionProgress && sectionProgress.totalCount > 0 ? (
                        <span className="learning-section-count">
                          {sectionProgress.completedCount}/{sectionProgress.totalCount}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  {expanded ? (
                    <ul id={`learning-section-${section.id}`} className="learning-lessons">
                      {section.lessons.map((lesson) => {
                        const completed = isLessonCompleted(lesson.id);
                        return (
                          <li key={lesson.id}>
                            <Link
                              to={`/courses/${courseId}/learn/${lesson.id}`}
                              aria-current={lesson.id === selectedLessonId ? 'page' : undefined}
                              className={completed ? 'is-completed' : undefined}
                            >
                              {completed ? (
                                <CompletedIcon />
                              ) : (
                                <span className="learning-lesson-icon-placeholder" aria-hidden="true" />
                              )}
                              <span>{lesson.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    </aside>
  );
}

function CompletedIcon() {
  return (
    <svg
      className="learning-lesson-complete-icon"
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' | 'down' }) {
  const rotation = direction === 'down' ? 90 : direction === 'left' ? 180 : 0;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M6 3.5 10.5 8 6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
