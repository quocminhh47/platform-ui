import { useState } from 'react';
import type { CourseCurriculumState } from '../hooks/useCourseCurriculum';
import { formatDuration } from '../utils/formatDuration';
import { formatLessonType } from '../utils/formatLessonType';

type CourseCurriculumProps = {
  state: CourseCurriculumState;
};

export function CourseCurriculum({ state }: CourseCurriculumProps) {
  const { sections, loading, error, reload } = state;
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);

  return (
    <section id="curriculum" className="course-curriculum" aria-labelledby="curriculum-heading">
      <h2 id="curriculum-heading">Curriculum</h2>

      {loading ? <p className="page-status">Loading curriculum…</p> : null}

      {!loading && error ? (
        <div className="section-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            Try again
          </button>
        </div>
      ) : null}

      {!loading && !error && sections && sections.length === 0 ? (
        <p className="muted">This course does not have any sections yet.</p>
      ) : null}

      {!loading && !error && sections && sections.length > 0 ? (
        <div className="curriculum-scroll">
          <ol className="curriculum-sections">
          {sections.map((section) => {
            const expanded = !collapsedIds.includes(section.id);
            const panelId = `curriculum-section-${section.id}`;
            return (
              <li key={section.id} className="curriculum-section">
                <button
                  type="button"
                  className="curriculum-section-toggle"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => {
                    setCollapsedIds((current) =>
                      current.includes(section.id)
                        ? current.filter((id) => id !== section.id)
                        : [...current, section.id],
                    );
                  }}
                >
                  <ChevronIcon expanded={expanded} />
                  <span className="curriculum-section-title">{section.title}</span>
                  <span className="curriculum-count">{lessonCountLabel(section.lessons.length)}</span>
                </button>
                {expanded ? (
                  <div id={panelId} className="curriculum-panel">
                    {section.lessons.length === 0 ? (
                      <p className="muted">No lessons in this section yet.</p>
                    ) : (
                      <ul className="curriculum-lessons">
                        {section.lessons.map((lesson) => {
                          const duration = formatDuration(lesson.durationSeconds);
                          return (
                            <li key={lesson.id}>
                              <span className="lesson-title">{lesson.title}</span>
                              <span className="lesson-meta">
                                {formatLessonType(lesson.lessonType)}
                                {duration ? ` · ${duration}` : ''}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div id={panelId} className="curriculum-panel" hidden />
                )}
              </li>
            );
          })}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function lessonCountLabel(count: number): string {
  return count === 1 ? '1 lesson' : `${count} lessons`;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      className={expanded ? 'curriculum-chevron is-open' : 'curriculum-chevron'}
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
