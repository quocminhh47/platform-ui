import type { ArticleStatus, ManageArticle } from '../types/manage-article.types';

export type MyArticleStatusFilter = 'ALL' | ArticleStatus;

export const MY_ARTICLE_STATUS_FILTERS: readonly {
  value: MyArticleStatusFilter;
  label: string;
}[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { value: 'PUBLISHED', label: 'Đã xuất bản' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'ARCHIVED', label: 'Đã lưu trữ' },
];

export function filterMyArticles(
  articles: ManageArticle[],
  status: MyArticleStatusFilter,
): ManageArticle[] {
  if (status === 'ALL') {
    return articles;
  }
  return articles.filter((article) => article.status === status);
}

export function countMyArticlesByStatus(
  articles: ManageArticle[],
): Record<MyArticleStatusFilter, number> {
  const counts: Record<MyArticleStatusFilter, number> = {
    ALL: articles.length,
    DRAFT: 0,
    PENDING_REVIEW: 0,
    PUBLISHED: 0,
    REJECTED: 0,
    ARCHIVED: 0,
  };
  for (const article of articles) {
    counts[article.status] += 1;
  }
  return counts;
}

export function emptyMyArticlesCopy(status: MyArticleStatusFilter, hasAnyArticles: boolean): {
  title: string;
  description: string;
} {
  if (!hasAnyArticles) {
    return {
      title: 'Bạn chưa có bài viết nào',
      description: 'Bắt đầu soạn bài và lưu nháp hoặc gửi duyệt.',
    };
  }
  switch (status) {
    case 'DRAFT':
      return {
        title: 'Không có bản nháp',
        description: 'Các bài viết đang soạn sẽ xuất hiện ở đây.',
      };
    case 'PENDING_REVIEW':
      return {
        title: 'Không có bài viết chờ duyệt',
        description: 'Bài đã gửi duyệt sẽ được liệt kê tại đây.',
      };
    case 'PUBLISHED':
      return {
        title: 'Không có bài viết đã xuất bản',
        description: 'Bài được quản trị viên phê duyệt sẽ xuất hiện ở đây.',
      };
    case 'REJECTED':
      return {
        title: 'Không có bài viết bị từ chối',
        description: 'Bài bị từ chối (kèm lý do) sẽ xuất hiện ở đây để bạn chỉnh sửa.',
      };
    case 'ARCHIVED':
      return {
        title: 'Không có bài viết đã lưu trữ',
        description: 'Bài đã lưu trữ chỉ xem được, không thể chỉnh sửa.',
      };
    default:
      return {
        title: 'Không có bài viết phù hợp',
        description: 'Thử chọn bộ lọc trạng thái khác.',
      };
  }
}

export function paginateMyArticles<T>(items: T[], page: number, pageSize: number): T[] {
  const start = Math.max(0, page) * pageSize;
  return items.slice(start, start + pageSize);
}
