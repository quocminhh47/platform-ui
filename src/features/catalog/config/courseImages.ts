/**
 * Fallback thumbnails keyed by course id.
 *
 * Primary source is CourseResponse.thumbnailUrl from GET /api/courses.
 * This map is used only when that field is missing, blank, or fails to load.
 * If both are unavailable, CourseImage draws a local illustration.
 *
 * Keys are course UUIDs. The Chinese-learning demo seed uses stable ids
 * dec00001-0001-4001-8001-000000000001 through …000008. Put a URL or a path
 * under /public (for example "/course-art/beginners.webp") in the value.
 * Leave the value empty to skip straight to the local illustration.
 */
export const courseImageUrls: Record<string, string> = {
  // Chinese for Absolute Beginners
  'dec00001-0001-4001-8001-000000000001': '',
  // HSK 1 Vocabulary and Grammar Essentials
  'dec00001-0001-4001-8001-000000000002': '',
  // Chinese Characters Made Practical (unpublished draft)
  'dec00001-0001-4001-8001-000000000003': '',
  // Everyday Mandarin Conversations
  'dec00001-0001-4001-8001-000000000004': '',
  // HSK 2 Listening and Speaking Bootcamp
  'dec00001-0001-4001-8001-000000000005': '',
  // Chinese Grammar Patterns for Intermediate Learners
  'dec00001-0001-4001-8001-000000000006': '',
  // Business Chinese Basics
  'dec00001-0001-4001-8001-000000000007': '',
  // Chinese Culture through Language
  'dec00001-0001-4001-8001-000000000008': '',
};

export function getCourseImageUrl(courseId: string): string | null {
  const url = courseImageUrls[courseId]?.trim();
  return url ? url : null;
}

/** API thumbnail first, then the id map. Null means use the local illustration. */
export function resolveCourseImageUrl(
  courseId: string,
  thumbnailUrl: string | null | undefined,
): string | null {
  const fromApi = thumbnailUrl?.trim();
  if (fromApi) {
    return fromApi;
  }
  return getCourseImageUrl(courseId);
}
