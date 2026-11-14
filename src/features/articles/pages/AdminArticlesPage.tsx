import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PaginationControls } from '../../../components/common/PaginationControls';
import type { PageResponse } from '../../../types/pagination.types';
import { useAuth } from '../../auth/hooks/useAuth';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { listAdminArticles } from '../api/admin-articles.api';
import { AdminArticleActions } from '../components/AdminArticleActions';
import type { ManageArticle } from '../types/manage-article.types';
import { MY_ARTICLE_STATUS_FILTERS, type MyArticleStatusFilter } from '../utils/my-article-filters';
import { articleStatusBadgeClass, articleStatusLabel } from '../utils/article-status-labels';
import { formatArticleDate } from '../utils/formatArticleDate';
import { articleEditorSaveMessage } from '../utils/article-editor-messages';
import '../admin-articles.css';

export function AdminArticlesPage() {
  const { user, accessToken } = useAuth();
  const [status, setStatus] = useState<MyArticleStatusFilter>('ALL');
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<PageResponse<ManageArticle> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!accessToken || user?.role !== 'ADMIN') return;
    let active = true;
    setLoading(true); setError(null);
    listAdminArticles(accessToken, page, status === 'ALL' ? undefined : status)
      .then(result => {
        if (!active) return;
        if (page > 0 && !result.content.length) setPage(Math.max(0, result.totalPages - 1));
        else setData(result);
      })
      .catch(cause => { if (active) setError(articleEditorSaveMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessToken, user?.role, page, status, revision]);
  if (user?.role !== 'ADMIN' || !accessToken) return null;
  return <DashboardLayout sidebar={<DashboardSidebar />}>
    <section className="admin-workspace-page admin-articles" aria-labelledby="articles-heading">
      <header className="my-articles-page-header"><h1 id="articles-heading">Quản lý bài viết</h1>
        <Link className="button-primary" to="/admin/articles/new">Viết bài mới</Link>
      </header>
      <label>Lọc theo trạng thái <select value={status} onChange={event => {
        setStatus(event.target.value as MyArticleStatusFilter); setPage(0);
      }}>{MY_ARTICLE_STATUS_FILTERS.map(filter => <option key={filter.value} value={filter.value}>{filter.label}</option>)}</select></label>
      {loading ? <p role="status">Đang tải bài viết…</p> : error ? <div role="alert"><p>{error}</p>
        <button onClick={() => setRevision(value => value + 1)}>Thử lại</button></div>
        : !data?.content.length ? <p>Không có bài viết phù hợp.</p> : <>
          <div className="admin-table-wrap"><table className="admin-table my-articles-table">
            <caption className="visually-hidden">Danh sách bài viết quản trị</caption>
            <thead><tr>{['Tiêu đề', 'Tác giả', 'Trạng thái', 'Ngày tạo', 'Cập nhật', 'Xuất bản', 'Thao tác'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
            <tbody>{data.content.map(article => <tr key={article.id}>
              <td data-label="Tiêu đề">{article.title}</td><td data-label="Tác giả">{article.authorName}</td>
              <td data-label="Trạng thái"><span className={articleStatusBadgeClass(article.status)}>{articleStatusLabel(article.status)}</span></td>
              <td data-label="Ngày tạo">{formatArticleDate(article.createdAt)}</td><td data-label="Cập nhật">{formatArticleDate(article.updatedAt)}</td>
              <td data-label="Xuất bản">{formatArticleDate(article.publishedAt) ?? '—'}</td>
              <td data-label="Thao tác"><div className="admin-article-actions">
                <Link className="button-secondary" to={`/admin/articles/${article.id}`}>Xem nội dung</Link>
                <AdminArticleActions article={article} accessToken={accessToken} onUpdated={() => setRevision(value => value + 1)} />
              </div></td>
            </tr>)}</tbody>
          </table></div>
          <PaginationControls page={data.page} totalPages={data.totalPages} totalElements={data.totalElements}
            onPageChange={setPage} label="Trang bài viết quản trị" />
        </>}
    </section>
  </DashboardLayout>;
}
