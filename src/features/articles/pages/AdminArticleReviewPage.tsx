import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { DashboardLayout } from '../../dashboard/components/DashboardLayout';
import { DashboardSidebar } from '../../dashboard/components/DashboardSidebar';
import { useManageArticle } from '../hooks/useManageArticle';
import { ArticleEditorPreview } from '../components/ArticleEditorPreview';
import { AdminArticleActions } from '../components/AdminArticleActions';
import { articleStatusLabel } from '../utils/article-status-labels';
import { formatArticleDate } from '../utils/formatArticleDate';
import '../admin-articles.css';

export function AdminArticleReviewPage() {
  const { id } = useParams();
  const { user, accessToken } = useAuth();
  const { article, loading, error, reload, setArticle } = useManageArticle(user?.role === 'ADMIN' ? accessToken : null, id);
  if (user?.role !== 'ADMIN' || !accessToken) return null;
  return <DashboardLayout sidebar={<DashboardSidebar />}>
    <section className="admin-workspace-page admin-articles">
      <Link to="/admin/articles">Quay lại quản lý bài viết</Link>
      <h1>Duyệt bài viết</h1>
      {loading ? <p role="status">Đang tải bài viết…</p> : error ? <div role="alert"><p>{error}</p><button onClick={reload}>Thử lại</button></div>
        : article ? <>
          <p>Trạng thái: {articleStatusLabel(article.status)}</p>
          <p>Ngày gửi duyệt: {formatArticleDate(article.submittedAt) ?? '—'}</p>
          {article.rejectionReason ? <p>Lý do từ chối: {article.rejectionReason}</p> : null}
          <div className="admin-article-actions"><AdminArticleActions article={article} accessToken={accessToken} onUpdated={setArticle} /></div>
          <section aria-label="Nội dung đang làm việc">
            <h2>{article.status === 'PENDING_REVIEW' ? 'Nội dung mới chờ duyệt' : 'Nội dung đang làm việc'}</h2>
            <ArticleEditorPreview previewLabel="Bản đang làm việc đã lưu" dateLabel="Nội dung đề xuất" title={article.title} excerpt={article.excerpt ?? ''}
              featuredImageUrl={article.featuredImageUrl ?? ''} contentHtml={article.contentHtml} authorName={article.authorName} />
          </section>
          {article.publishedContentHtml !== null ? <section aria-label="Phiên bản đã xuất bản">
            <h2>{article.status === 'ARCHIVED' ? 'Phiên bản đã xuất bản (đã ẩn)' : 'Nội dung hiện đang công khai'}</h2>
            <p>Ngày xuất bản: {formatArticleDate(article.publishedAt) ?? '—'}</p>
            <ArticleEditorPreview previewLabel="Phiên bản đã xuất bản" dateLabel={`Xuất bản: ${formatArticleDate(article.publishedAt) ?? '—'}`} title={article.publishedTitle ?? ''} excerpt={article.publishedExcerpt ?? ''}
              featuredImageUrl={article.publishedFeaturedImageUrl ?? ''} contentHtml={article.publishedContentHtml} authorName={article.authorName} />
          </section> : null}
        </> : null}
    </section>
  </DashboardLayout>;
}
