import { useState } from 'react';
import type { ArticleSnapshot } from '../../catalog/types/article.types';
import { refreshLessonArticle } from '../api/admin-lessons.api';
import { adminArticleExtractionStatusLabel } from '../utils/admin-article-extraction';

type AdminArticleExtractionControlsProps = {
  courseId: string;
  sectionId: string;
  lessonId: string;
  accessToken: string;
  article: ArticleSnapshot | null | undefined;
  onLessonUpdated: () => Promise<unknown>;
  onToastSuccess: (message: string) => void;
  onToastError: (message: string) => void;
};

export function AdminArticleExtractionControls({
  courseId,
  sectionId,
  lessonId,
  accessToken,
  article,
  onLessonUpdated,
  onToastSuccess,
  onToastError,
}: AdminArticleExtractionControlsProps) {
  const [refreshing, setRefreshing] = useState(false);

  const status = article?.extractionStatus ?? null;
  const statusLabel = adminArticleExtractionStatusLabel(status);

  async function handleRefresh() {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    try {
      await refreshLessonArticle(accessToken, courseId, sectionId, lessonId);
      onToastSuccess('Đã làm mới nội dung bài đọc.');
      await onLessonUpdated();
    } catch {
      onToastError('Không thể làm mới bài đọc. Vui lòng thử lại.');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="admin-article-extraction-panel">
      <p className="admin-article-extraction-status" data-status={status ?? 'none'}>
        Trạng thái trích xuất: <strong>{statusLabel}</strong>
      </p>
      {status === 'FAILED' && article?.extractionError ? (
        <p className="section-error admin-article-extraction-error" role="alert">
          {article.extractionError}
        </p>
      ) : null}
      <button
        type="button"
        className="button-secondary"
        disabled={refreshing}
        onClick={() => void handleRefresh()}
      >
        {refreshing ? 'Đang làm mới…' : 'Làm mới bài đọc'}
      </button>
    </div>
  );
}
