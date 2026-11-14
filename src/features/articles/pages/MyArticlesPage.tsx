import { useEffect, useMemo, useState } from 'react';
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
import {
  countMyArticlesByStatus,
  emptyMyArticlesCopy,
  filterMyArticles,
  MY_ARTICLE_STATUS_FILTERS,
  paginateMyArticles,
  type MyArticleStatusFilter,
} from '../utils/my-article-filters';
import type { ManageArticle } from '../types/manage-article.types';

const PAGE_SIZE = 10;

export function MyArticlesPage() {
  const { user, accessToken } = useAuth();
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<MyArticleStatusFilter>('ALL');
  const [submitBusyId, setSubmitBusyId] = useState<string | null>(null);
  const mine = useMyArticles(accessToken);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const allArticles = mine.articles ?? [];
  const counts = useMemo(() => countMyArticlesByStatus(allArticles), [allArticles]);
  const filtered = useMemo(
    () => filterMyArticles(allArticles, statusFilter),
    [allArticles, statusFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visible = paginateMyArticles(filtered, safePage, PAGE_SIZE);

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

  const emptyCopy = emptyMyArticlesCopy(statusFilter, allArticles.length > 0);
  const showEmpty =
    !mine.loading && !mine.error && mine.articles !== null && visible.length === 0;

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

        <div className="my-articles-filters" role="tablist" aria-label="Lọc theo trạng thái">
          {MY_ARTICLE_STATUS_FILTERS.map((filter) => {
            const selected = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`my-articles-filter${selected ? ' is-active' : ''}`}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
                <span className="my-articles-filter-count">{counts[filter.value]}</span>
              </button>
            );
          })}
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

        {showEmpty ? (
          <div className="empty-state">
            <p className="empty-state-title">{emptyCopy.title}</p>
            <p className="muted">{emptyCopy.description}</p>
            {allArticles.length === 0 ? (
              <p>
                <Link className="landing-btn landing-btn-outline" to="/articles/create">
                  Viết bài đầu tiên
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {!mine.loading && !mine.error && visible.length > 0 ? (
          <>
            <MyArticleTable
              articles={visible}
              busyId={submitBusyId}
              onSubmit={handleSubmit}
            />
            {filtered.length > PAGE_SIZE ? (
              <PaginationControls
                page={safePage}
                totalPages={totalPages}
                totalElements={filtered.length}
                disabled={mine.loading || Boolean(submitBusyId)}
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
