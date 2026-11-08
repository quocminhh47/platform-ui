const adminDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatAdminDateTime(iso: string | null | undefined): string {
  if (!iso?.trim()) {
    return '—';
  }
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) {
    return '—';
  }
  return adminDateFormatter.format(parsed);
}
