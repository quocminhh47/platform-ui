import { useMemo, useState } from 'react';
import type { CourseCurriculumState } from '../hooks/useCourseCurriculum';
import {
  formatCurriculumSummaryLine,
  summarizeCurriculum,
} from '../utils/curriculumSummary';
import { formatDuration } from '../utils/formatDuration';
import { formatLessonType } from '../utils/formatLessonType';
import type { LessonType } from '../types/lesson.types';

type CourseCurriculumProps = {
  state: CourseCurriculumState;
  variant?: 'default' | 'detail';
};

export function CourseCurriculum({ state, variant = 'default' }: CourseCurriculumProps) {
  const { sections, loading, error, reload } = state;
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const isDetail = variant === 'detail';
  const summary = useMemo(() => summarizeCurriculum(sections), [sections]);
  const summaryLine = formatCurriculumSummaryLine(summary);
  const allExpanded = sections ? collapsedIds.length === 0 : true;

  if (isDetail) {
    return (
      <section
        id="curriculum"
        className="course-detail-curriculum"
        aria-labelledby="curriculum-heading"
      >
        <div className="course-detail-curriculum-header">
          <div>
            <h2 id="curriculum-heading">Nội dung khóa học</h2>
            {!loading && sections && sections.length > 0 && summaryLine ? (
              <p className="course-detail-curriculum-summary">{summaryLine}</p>
            ) : null}
          </div>
          {sections && sections.length > 0 ? (
            <button
              type="button"
              className="course-detail-curriculum-toggle-all"
              onClick={() => {
                if (!sections) {
                  return;
                }
                if (allExpanded) {
                  setCollapsedIds(sections.map((section) => section.id));
                } else {
                  setCollapsedIds([]);
                }
              }}
            >
              {allExpanded ? 'Thu gọn tất cả các phần' : 'Mở rộng tất cả các phần'}
            </button>
          ) : null}
        </div>

        {loading ? <p className="page-status">Đang tải chương trình học…</p> : null}

        {!loading && error ? (
          <div className="section-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={reload}>
              Thử lại
            </button>
          </div>
        ) : null}

        {!loading && !error && sections && sections.length === 0 ? (
          <p className="muted">Khóa học chưa có chương nào.</p>
        ) : null}

        {!loading && !error && sections && sections.length > 0 ? (
          <div className="course-detail-curriculum-sections">
            {sections.map((section) => {
              const expanded = !collapsedIds.includes(section.id);
              const panelId = `curriculum-section-${section.id}`;
              const sectionDuration = section.lessons.reduce((total, lesson) => {
                if (lesson.durationSeconds !== null && Number.isFinite(lesson.durationSeconds)) {
                  return total + lesson.durationSeconds;
                }
                return total;
              }, 0);
              const sectionDurationLabel = formatDuration(sectionDuration);

              return (
                <article key={section.id} className="course-detail-curriculum-section">
                  <button
                    type="button"
                    className="course-detail-curriculum-section-toggle"
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
                    <ChevronDown expanded={expanded} />
                    <span className="course-detail-curriculum-section-title">{section.title}</span>
                    <span className="course-detail-curriculum-section-meta">
                      {section.lessons.length} bài học
                      {sectionDurationLabel ? ` • ${sectionDurationLabel}` : ''}
                    </span>
                  </button>
                  {expanded ? (
                    <ul id={panelId} className="course-detail-curriculum-lessons">
                      {section.lessons.length === 0 ? (
                        <li className="muted">Chưa có bài học trong phần này.</li>
                      ) : (
                        section.lessons.map((lesson) => {
                          const duration = formatDuration(lesson.durationSeconds);
                          return (
                            <li key={lesson.id}>
                              <LessonTypeIcon type={lesson.lessonType} />
                              <span className="course-detail-lesson-title">{lesson.title}</span>
                              <span className="course-detail-lesson-meta">
                                {formatLessonTypeDetail(lesson.lessonType)}
                                {duration ? ` • ${duration}` : ''}
                              </span>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  ) : (
                    <ul id={panelId} className="course-detail-curriculum-lessons" hidden />
                  )}
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    );
  }

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

function formatLessonTypeDetail(lessonType: LessonType): string {
  const labels: Record<LessonType, string> = {
    VIDEO: 'Video',
    ARTICLE: 'Tài liệu',
    QUIZ: 'Quiz',
    ASSIGNMENT: 'Bài tập',
  };
  return labels[lessonType] ?? lessonType;
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

function ChevronDown({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className={expanded ? 'course-detail-chevron is-open' : 'course-detail-chevron'}
    >
      <path d="M19 9l-7 7-7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LessonTypeIcon({ type }: { type: LessonType }) {
  if (type === 'VIDEO') {
    return (
      <svg aria-hidden="true" className="course-detail-lesson-icon is-video" viewBox="0 0 20 20" width="16" height="16">
        <path
          fill="currentColor"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
        />
      </svg>
    );
  }
  if (type === 'QUIZ') {
    return (
      <svg aria-hidden="true" className="course-detail-lesson-icon is-quiz" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
        <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" className="course-detail-lesson-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
