import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/feedback/useToast';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  adminPublishArticle,
  createArticle,
  saveArticleDraft,
  submitArticle,
  updateArticle,
} from '../api/manage-articles.api';
import type { ManageArticle } from '../types/manage-article.types';
import { articleEditorSaveMessage } from '../utils/article-editor-messages';
import {
  buildArticleWriteBody,
  validateArticleEditor,
  type ArticleEditorFieldErrors,
  type ArticleEditorValues,
} from '../validation/article-editor.validation';
import { ArticleEditorPreview } from './ArticleEditorPreview';
import { RichTextEditor } from './RichTextEditor';

type ArticleEditorProps = {
  mode: 'create' | 'edit';
  article?: ManageArticle | null;
  onArticleChange?: (article: ManageArticle) => void;
  showPreview?: boolean;
  onShowPreviewChange?: (showPreview: boolean) => void;
};

export function ArticleEditor({
  mode,
  article,
  onArticleChange,
  showPreview: showPreviewProp,
  onShowPreviewChange,
}: ArticleEditorProps) {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [values, setValues] = useState<ArticleEditorValues>(() => valuesFromArticle(article));
  const [internalShowPreview, setInternalShowPreview] = useState(false);
  const previewControlled = onShowPreviewChange !== undefined;
  const showPreview = previewControlled ? Boolean(showPreviewProp) : internalShowPreview;

  function setShowPreview(next: boolean) {
    if (previewControlled) {
      onShowPreviewChange?.(next);
      return;
    }
    setInternalShowPreview(next);
  }
  const [fieldErrors, setFieldErrors] = useState<ArticleEditorFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'draft' | 'submit' | 'publish' | null>(null);
  const inFlightRef = useRef(false);

  const articleId = article?.id;
  const status = article?.status;
  const readOnly = status === 'PENDING_REVIEW' || status === 'ARCHIVED';
  const editorKey = mode === 'create' ? 'new' : (articleId ?? 'loading');

  useEffect(() => {
    if (mode === 'edit' && article) {
      setValues(valuesFromArticle(article));
    }
  }, [mode, article?.id, article?.updatedAt]);

  function patchValues(patch: Partial<ArticleEditorValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function validateForm(): boolean {
    const result = validateArticleEditor(values, { requireRichContent: true });
    setFieldErrors(result.fieldErrors);
    setFormError(result.formError);
    return Object.keys(result.fieldErrors).length === 0;
  }

  async function runAction<T extends 'draft' | 'submit' | 'publish'>(
    action: T,
    handler: () => Promise<ManageArticle>,
    options?: { redirectOnCreate?: string },
  ) {
    if (!accessToken || inFlightRef.current) {
      return;
    }
    if (!validateForm()) {
      return;
    }
    inFlightRef.current = true;
    setBusy(action);
    setFormError(null);
    try {
      const saved = await handler();
      onArticleChange?.(saved);
      toast.success(successMessage(action, status));
      if (options?.redirectOnCreate) {
        navigate(options.redirectOnCreate);
      } else if (mode === 'create' && saved.id) {
        navigate(`/articles/edit/${saved.id}`, { replace: true });
      }
    } catch (cause: unknown) {
      setFormError(articleEditorSaveMessage(cause));
    } finally {
      setBusy(null);
      inFlightRef.current = false;
    }
  }

  async function handleSaveDraft() {
    if (!accessToken) {
      return;
    }
    const soft = validateArticleEditor(values, { requireRichContent: true });
    setFieldErrors(soft.fieldErrors);
    setFormError(soft.formError);
    if (Object.keys(soft.fieldErrors).length > 0) {
      return;
    }
    const body = buildArticleWriteBody(values);

    if (mode === 'create') {
      await runAction('draft', () => createArticle(accessToken, body));
      return;
    }
    if (!articleId) {
      return;
    }
    if (status === 'DRAFT' || status === 'REJECTED') {
      await runAction('draft', () => saveArticleDraft(accessToken, articleId, body));
      return;
    }
    if (status === 'PUBLISHED') {
      await runAction('draft', () => updateArticle(accessToken, articleId, body));
    }
  }

  async function handleSubmit() {
    if (!accessToken) {
      return;
    }

    await runAction('submit', async () => {
      const body = buildArticleWriteBody(values);
      let id = articleId;
      if (mode === 'create') {
        const created = await createArticle(accessToken, body);
        id = created.id;
      } else if (id && (status === 'DRAFT' || status === 'REJECTED')) {
        await saveArticleDraft(accessToken, id, body);
      } else if (id && status === 'PUBLISHED') {
        return updateArticle(accessToken, id, body);
      }
      if (!id) {
        throw new Error('Missing article id');
      }
      return submitArticle(accessToken, id);
    });
  }

  async function handleAdminPublish() {
    if (!accessToken || !isAdmin) {
      return;
    }

    if (mode === 'create') {
      await runAction(
        'publish',
        () => createArticle(accessToken, buildArticleWriteBody(values, true)),
        { redirectOnCreate: '/articles' },
      );
      return;
    }
    if (!articleId) {
      return;
    }

    if (status === 'DRAFT' || status === 'REJECTED') {
      await runAction('publish', async () => {
        await saveArticleDraft(accessToken, articleId, buildArticleWriteBody(values));
        return adminPublishArticle(accessToken, articleId);
      });
      return;
    }

    await runAction(
      'publish',
      () => updateArticle(accessToken, articleId, buildArticleWriteBody(values, true)),
    );
  }

  const showSubmit =
    !readOnly && (status === 'DRAFT' || status === 'REJECTED' || status === 'PUBLISHED' || mode === 'create');
  const showAdminPublish = isAdmin && !readOnly;

  return (
    <form
      className="article-editor-form"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      {article?.slug ? (
        <p className="muted article-editor-slug">
          Đường dẫn: <code>/articles/{article.slug}</code>
        </p>
      ) : null}

      {status === 'PENDING_REVIEW' ? (
        <p className="article-editor-status-callout" role="status">
          Bài viết đang chờ duyệt. Bạn không thể chỉnh sửa cho đến khi quản trị viên phê duyệt hoặc từ
          chối.
        </p>
      ) : null}
      {status === 'ARCHIVED' ? (
        <p className="article-editor-status-callout" role="status">
          Bài viết đã được lưu trữ và không thể chỉnh sửa.
        </p>
      ) : null}
      {status === 'REJECTED' && article?.rejectionReason ? (
        <p className="article-editor-rejection" role="alert">
          Lý do từ chối: {article.rejectionReason}
        </p>
      ) : null}

      {formError ? (
        <p className="form-error" role="alert">
          {formError}
        </p>
      ) : null}

      {!previewControlled ? (
        <div className="article-editor-preview-toggle">
          <label className="article-editor-preview-switch">
            <input
              type="checkbox"
              checked={showPreview}
              onChange={(event) => setShowPreview(event.target.checked)}
            />
            Xem trước
          </label>
        </div>
      ) : null}

      {showPreview ? (
        <ArticleEditorPreview
          title={values.title}
          excerpt={values.excerpt}
          featuredImageUrl={values.featuredImageUrl}
          contentHtml={values.contentHtml}
          authorName={user?.fullName}
        />
      ) : (
        <>
          <Field label="Tiêu đề" required error={fieldErrors.title}>
            <input
              className="article-editor-input"
              type="text"
              value={values.title}
              disabled={readOnly}
              placeholder="Nhập tiêu đề bài viết"
              aria-invalid={Boolean(fieldErrors.title)}
              onChange={(event) => patchValues({ title: event.target.value })}
            />
          </Field>

          <Field label="Tóm tắt">
            <textarea
              className="article-editor-input article-editor-textarea"
              value={values.excerpt}
              disabled={readOnly}
              rows={3}
              placeholder="Mô tả ngắn hiển thị trên danh sách bài viết"
              onChange={(event) => patchValues({ excerpt: event.target.value })}
            />
          </Field>

          <Field label="Ảnh bìa (URL)" error={fieldErrors.featuredImageUrl}>
            <input
              className="article-editor-input"
              type="url"
              value={values.featuredImageUrl}
              disabled={readOnly}
              placeholder="https://"
              aria-invalid={Boolean(fieldErrors.featuredImageUrl)}
              onChange={(event) => patchValues({ featuredImageUrl: event.target.value })}
            />
          </Field>

          <Field label="Nội dung" required error={fieldErrors.contentHtml}>
            <RichTextEditor
              editorKey={editorKey}
              initialHtml={values.contentHtml}
              disabled={readOnly}
              aria-invalid={Boolean(fieldErrors.contentHtml)}
              onHtmlChange={(html) => patchValues({ contentHtml: html })}
            />
          </Field>
        </>
      )}

      <div className="article-editor-actions">
        {!readOnly ? (
          <button
            type="button"
            className="button-secondary article-editor-action-btn"
            disabled={busy !== null}
            onClick={() => void handleSaveDraft()}
          >
            {busy === 'draft' ? 'Đang lưu…' : saveDraftLabel(status, mode)}
          </button>
        ) : null}
        {showSubmit && !isAdmin ? (
          <button
            type="button"
            className="button-primary article-editor-action-btn"
            disabled={busy !== null}
            onClick={() => void handleSubmit()}
          >
            {busy === 'submit' ? 'Đang gửi…' : submitLabel(status, mode)}
          </button>
        ) : null}
        {showSubmit && isAdmin && (status === 'DRAFT' || status === 'REJECTED' || mode === 'create') ? (
          <button
            type="button"
            className="button-secondary article-editor-action-btn"
            disabled={busy !== null}
            onClick={() => void handleSubmit()}
          >
            {busy === 'submit' ? 'Đang gửi…' : 'Gửi duyệt'}
          </button>
        ) : null}
        {showAdminPublish ? (
          <button
            type="button"
            className="button-primary button-publish article-editor-action-btn"
            disabled={busy !== null}
            onClick={() => void handleAdminPublish()}
          >
            {busy === 'publish' ? 'Đang xuất bản…' : 'Xuất bản'}
          </button>
        ) : null}
        {article?.slug ? (
          <Link className="button-secondary article-editor-action-btn" to={`/articles/${article.slug}`}>
            Xem bài công khai
          </Link>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="form-field">
      <span>
        {label} {required ? <span className="required">*</span> : null}
      </span>
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

function valuesFromArticle(article: ManageArticle | null | undefined): ArticleEditorValues {
  if (!article) {
    return { title: '', excerpt: '', featuredImageUrl: '', contentHtml: '<p></p>' };
  }
  return {
    title: article.title ?? '',
    excerpt: article.excerpt ?? '',
    featuredImageUrl: article.featuredImageUrl ?? '',
    contentHtml: article.contentHtml?.trim() ? article.contentHtml : '<p></p>',
  };
}

function saveDraftLabel(status: ManageArticle['status'] | undefined, mode: 'create' | 'edit') {
  if (mode === 'create' || status === 'DRAFT' || status === 'REJECTED') {
    return 'Lưu nháp';
  }
  if (status === 'PUBLISHED') {
    return 'Lưu & gửi duyệt';
  }
  return 'Lưu';
}

function submitLabel(status: ManageArticle['status'] | undefined, mode: 'create' | 'edit') {
  if (status === 'PUBLISHED') {
    return 'Gửi bản cập nhật duyệt';
  }
  if (mode === 'create') {
    return 'Gửi duyệt';
  }
  return 'Gửi duyệt';
}

function successMessage(
  action: 'draft' | 'submit' | 'publish',
  status: ManageArticle['status'] | undefined,
) {
  if (action === 'draft' && status === 'PUBLISHED') {
    return 'Đã lưu và gửi bản cập nhật để duyệt.';
  }
  switch (action) {
    case 'draft':
      return 'Đã lưu nháp.';
    case 'submit':
      return 'Đã gửi bài viết để duyệt.';
    case 'publish':
      return 'Đã xuất bản bài viết.';
    default:
      return 'Đã lưu.';
  }
}
