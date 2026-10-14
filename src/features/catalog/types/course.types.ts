/**
 * Mirrors backend CourseResponse.
 * `description`, `thumbnailUrl`, and `finalQuizId` are nullable.
 * `price` is a BigDecimal serialized as a JSON number.
 * There is no category or rating field.
 * `instructorName` and `lessonCount` are present on the current Java contract;
 * older responses may omit them, so the UI treats them as optional.
 */
export type Course = {
  id: string;
  title: string;
  description: string | null;
  instructorId: string;
  instructorName?: string | null;
  price: number;
  thumbnailUrl?: string | null;
  lessonCount?: number;
  published: boolean;
  finalQuizId: string | null;
  createdAt: string;
  updatedAt: string;
};
