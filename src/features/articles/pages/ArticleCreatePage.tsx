import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { breadcrumbArticles, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { ArticleEditor } from '../components/ArticleEditor';
import { ArticleEditorModeToggle } from '../components/ArticleEditorModeToggle';

export function ArticleCreatePage() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="landing-container article-editor-page">
      <Breadcrumb
        items={[
          breadcrumbHome(),
          breadcrumbArticles(),
          { label: 'Viết bài mới' },
        ]}
      />
      <header className="article-editor-page-header article-editor-page-header--split">
        <div className="article-editor-page-header-main">
          <h1>Viết bài mới</h1>
          <p className="muted">
            Soạn nội dung và lưu nháp hoặc gửi duyệt.{' '}
            <Link className="landing-text-link" to="/articles">
              Quay lại danh sách
            </Link>
          </p>
        </div>
        <ArticleEditorModeToggle showPreview={showPreview} onChange={setShowPreview} />
      </header>
      <ArticleEditor
        mode="create"
        showPreview={showPreview}
        onShowPreviewChange={setShowPreview}
      />
    </div>
  );
}
