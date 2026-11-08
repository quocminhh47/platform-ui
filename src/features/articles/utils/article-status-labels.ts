import type { ArticleStatus } from '../types/manage-article.types';

const LABELS: Record<ArticleStatus, string> = {
  DRAFT: 'Bản nháp',
  PENDING_REVIEW: 'Chờ duyệt',
  PUBLISHED: 'Đã xuất bản',
  REJECTED: 'Bị từ chối',
  ARCHIVED: 'Đã lưu trữ',
};

export function articleStatusLabel(status: ArticleStatus): string {
  return LABELS[status] ?? status;
}

export function articleStatusBadgeClass(status: ArticleStatus): string {
  const suffix = status.toLowerCase().replaceAll('_', '-');
  return `article-status-badge article-status-badge--${suffix}`;
}
