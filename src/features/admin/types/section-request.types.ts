/** Mirrors backend CreateSectionRequest. */
export type CreateSectionPayload = {
  title: string;
  sortOrder?: number | null;
};

/** Mirrors backend UpdateSectionRequest (partial patch). */
export type UpdateSectionPayload = {
  title?: string;
  sortOrder?: number | null;
};
