/**
 * Mirrors backend CourseResponse.
 * `description` and `finalQuizId` are nullable on the entity.
 * `price` is a BigDecimal serialized as a JSON number.
 */
export type Course = {
  id: string;
  title: string;
  description: string | null;
  instructorId: string;
  price: number;
  published: boolean;
  finalQuizId: string | null;
  createdAt: string;
  updatedAt: string;
};
