/** Shared API error shape returned by the LMS backend. */
export type ApiErrorBody = {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
  details?: string[] | null;
};
