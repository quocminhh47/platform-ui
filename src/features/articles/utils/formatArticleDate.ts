/** Formats an ISO date string for Vietnamese UI copy. */
export function formatArticleDate(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
}
