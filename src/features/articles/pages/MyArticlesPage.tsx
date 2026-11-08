import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { PaginationControls } from '../../../components/common/PaginationControls';
import { useToast } from '../../../components/feedback/useToast';
import { breadcrumbHome, breadcrumbMyArticles } from '../../../navigation/breadcrumb-trail';
import { UI_COPY } from '../../../ui/ui-copy';
import { useAuth } from '../../auth/hooks/useAuth';
import { DashboardHeader } from '../../dashboard/components/DashboardHeader';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { submitArticle } from '../api/manage-articles.api';
import { MyArticleTable } from '../components/MyArticleTable';
import { useMyArticles } from '../hooks/useMyArticles';
import { articleEditorSaveMessage } from '../utils/article-editor-messages';
import type { ManageArticle } from '../types/manage-article.types';

const PAGE_SIZE = 10;

export function MyArticlesPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [submitBusyId, setSubmitBusyId] = useState<string | null>(null);
  const mine = useMyArticles(accessToken, { page, size: PAGE_SIZE });

  if (!user) {
    return null;
  }

  async function handleSubmit(article: ManageArticle) {
    if (!accessToken || submitBusyId) {
      return;
    }
    setSubmitBusyId(article.id);
    try {
      await submitArticle(accessToken, article.id);
      toast.success('Đã gửi bài viết để duyệt.');
      mine.reload();
    } catch (cause: unknown) {
      toast.error(articleEditorSaveMessage(cause));
    } finally {
      setSubmitBusyId(null);
    }
  }

  return (
    <DashboardLayout sidebar={<DashboardSidebar />} header={<DashboardHeader user={user} />}>
      <Breadcrumb items={[breadcrumbHome(), breadcrumbMyArticles()]} />
      <section className="my-articles-page" aria-labelledby="my-articles-heading">
        <div className="my-articles-page-header">
          <h1 id="my-articles-heading">Bài viết của tôi</h1>
          <Link className="button-primary" to="/articles/create">
            Viết bài mới
          </Link>
        </div>

        {mine.loading ? <p className="page-status">Đang tải bài viết…</p> : null}

        {!mine.loading && mine.error ? (
          <div className="section-error" role="alert">
            <p>{mine.error}</p>
            <button type="button" onClick={mine.reload}>
              {UI_COPY.tryAgain}
            </button>
          </div>
        ) : null}

        {!mine.loading && !mine.error && mine.articles && mine.articles.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Bạn chưa có bài viết nào</p>
            <p className="muted">Bắt đầu soạn bài và lưu nháp hoặc gửi duyệt.</p>
            <p>
              <Link className="landing-btn landing-btn-outline" to="/articles/create">
                Viết bài đầu tiên
              </Link>
            </p>
          </div>
        ) : null}

        {!mine.loading && !mine.error && mine.articles && mine.articles.length > 0 ? (
          <>
            <MyArticleTable
              articles={mine.articles}
              busyId={submitBusyId}
              onSubmit={handleSubmit}
            />
            {mine.page ? (
              <PaginationControls
                page={mine.page.page}
                totalPages={mine.page.totalPages}
                totalElements={mine.page.totalElements}
                disabled={mine.loading}
                onPageChange={setPage}
                label="Trang bài viết"
              />
            ) : null}
          </>
        ) : null}
      </section>
    </DashboardLayout>
  );
}
