import type { CourseCurriculumState } from '../hooks/useCourseCurriculum';
import { formatDuration } from '../utils/formatDuration';
import { formatLessonType } from '../utils/formatLessonType';

type CourseCurriculumProps = {
  state: CourseCurriculumState;
};

export function CourseCurriculum({ state }: CourseCurriculumProps) {
  const { sections, loading, error, reload } = state;

  return (
    <section className="course-curriculum" aria-labelledby="curriculum-heading">
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
        <ol className="curriculum-sections">
          {sections.map((section) => (
            <li key={section.id} className="curriculum-section">
              <h3>{section.title}</h3>
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
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
