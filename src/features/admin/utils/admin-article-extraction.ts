import type { ArticleExtractionStatus } from '../../catalog/types/article.types';

export function adminArticleExtractionStatusLabel(
  status: ArticleExtractionStatus | null,
): string {
  switch (status) {
    case 'PENDING':
      return 'Đang trích xuất';
    case 'SUCCESS':
      return 'Đã trích xuất';
    case 'FAILED':
      return 'Trích xuất thất bại';
    default:
      return 'Chưa trích xuất';
  }
}
