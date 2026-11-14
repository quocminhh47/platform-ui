import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { MemberPageShell } from '../../../components/layout/MemberPageShell';
import {
  breadcrumbArticles,
  breadcrumbHome,
  breadcrumbMyArticles,
} from '../../../navigation/breadcrumb-trail';
import { UI_COPY } from '../../../ui/ui-copy';
import { useAuth } from '../../auth/hooks/useAuth';
import { ArticleEditor } from '../components/ArticleEditor';
import { ArticleEditorModeToggle } from '../components/ArticleEditorModeToggle';
import { useManageArticle } from '../hooks/useManageArticle';
import {
  articleStatusBadgeClass,
  articleStatusLabel,
} from '../utils/article-status-labels';

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const { article, loading, error, reload, setArticle } = useManageArticle(accessToken, id);
  const [showPreview, setShowPreview] = useState(false);

  const previewLocked =
    article?.status === 'PENDING_REVIEW' || article?.status === 'ARCHIVED';

  return (
    <MemberPageShell>
    <div className="landing-container article-editor-page">
      <Breadcrumb
        items={[
          breadcrumbHome(),
          breadcrumbArticles(),
          breadcrumbMyArticles(),
          { label: loading ? 'Đang tải…' : article?.title?.trim() || 'Chỉnh sửa' },
        ]}
      />
      <header className="article-editor-page-header article-editor-page-header--split">
        <div className="article-editor-page-header-main">
          <h1>Chỉnh sửa bài viết</h1>
          {article ? (
            <p className="article-editor-status-line">
              <span className={articleStatusBadgeClass(article.status)}>
                {articleStatusLabel(article.status)}
              </span>
            </p>
          ) : null}
          <p className="muted">
            <Link className="landing-text-link" to="/my-articles">
              Quay lại bài viết của tôi
            </Link>
          </p>
        </div>
        {!loading && article ? (
          <ArticleEditorModeToggle
            showPreview={showPreview}
            onChange={setShowPreview}
            disabled={previewLocked}
          />
        ) : null}
      </header>

      {loading ? <p className="page-status">Đang tải bài viết…</p> : null}

      {!loading && error ? (
        <div className="section-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={reload}>
            {UI_COPY.tryAgain}
          </button>
        </div>
      ) : null}

      {!loading && !error && article ? (
        <ArticleEditor
          mode="edit"
          article={article}
          onArticleChange={setArticle}
          showPreview={showPreview}
          onShowPreviewChange={setShowPreview}
        />
      ) : null}
    </div>
    </MemberPageShell>
  );
}
