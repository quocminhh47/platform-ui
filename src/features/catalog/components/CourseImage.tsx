import { useState } from 'react';
import { getCourseImageUrl, resolveCourseImageUrl } from '../config/courseImages';

type CourseImageProps = {
  courseId: string;
  title: string;
  thumbnailUrl?: string | null;
  /** Load immediately for the course-detail banner. Cards stay lazy. */
  priority?: boolean;
};

export function CourseImage({ courseId, title, thumbnailUrl, priority = false }: CourseImageProps) {
  const preferred = resolveCourseImageUrl(courseId, thumbnailUrl);
  const mapped = getCourseImageUrl(courseId);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const label = `${title} thumbnail`;

  const src = preferred && failedSrc !== preferred ? preferred : nextSource(preferred, mapped, failedSrc);

  return (
    <div className="course-media">
      {src ? (
        <img
          src={src}
          alt={label}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className="course-media-fallback" role="img" aria-label={label}>
          <CourseMark />
        </div>
      )}
    </div>
  );
}

function nextSource(
  preferred: string | null,
  mapped: string | null,
  failedSrc: string | null,
): string | null {
  if (preferred && failedSrc === preferred && mapped && mapped !== preferred) {
    return mapped;
  }
  return null;
}

function CourseMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 64" className="course-media-mark">
      <rect x="8" y="14" width="40" height="36" rx="4" fill="#0b3b67" />
      <rect x="32" y="8" width="40" height="36" rx="4" fill="#f59e0b" />
      <path d="M18 28h16M18 36h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
