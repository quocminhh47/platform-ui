/** Mirrors backend CreateCourseRequest. */
export type CreateCoursePayload = {
  title: string;
  description?: string | null;
  instructorId: string;
  price: number;
  thumbnailUrl?: string | null;
  published?: boolean | null;
};

/** Mirrors backend UpdateCourseRequest (partial patch). */
export type UpdateCoursePayload = {
  title?: string;
  description?: string | null;
  price?: number;
  thumbnailUrl?: string | null;
  published?: boolean | null;
};
