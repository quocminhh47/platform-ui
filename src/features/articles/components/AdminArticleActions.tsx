import { useEffect, useRef, useState } from 'react';
import { useToast } from '../../../components/feedback/useToast';
import { adminPublishArticle, moderateArticle } from '../api/admin-articles.api';
import type { ManageArticle } from '../types/manage-article.types';
import { articleEditorSaveMessage } from '../utils/article-editor-messages';

const labels = { approve: 'Phê duyệt', reject: 'Từ chối', publish: 'Xuất bản', archive: 'Lưu trữ' };
type Action = keyof typeof labels;

export function AdminArticleActions({ article, accessToken, onUpdated }: {
  article: ManageArticle; accessToken: string; onUpdated: (article: ManageArticle) => void;
}) {
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const toast = useToast();
  useEffect(() => {
    if (action) {
      dialog.current?.showModal();
    }
  }, [action]);
  function close() {
    if (inFlight.current) return;
    dialog.current?.close();
    setAction(null);
    trigger.current?.focus();
  }
  async function submit() {
    if (!action || inFlight.current) return;
    if (action === 'reject' && (!reason.trim() || reason.trim().length > 2000)) {
      setError('Nhập lý do từ chối có nội dung, tối đa 2.000 ký tự.');
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const updated = action === 'publish'
        ? await adminPublishArticle(accessToken, article.id)
        : await moderateArticle(accessToken, article.id, action, reason.trim());
      toast.success(`Đã ${labels[action].toLowerCase()} bài viết.`);
      inFlight.current = false;
      close();
      onUpdated(updated);
    } catch (cause) {
      setError(articleEditorSaveMessage(cause));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  const actions: Action[] = article.status === 'PENDING_REVIEW' ? ['approve', 'reject']
    : article.status === 'DRAFT' || article.status === 'REJECTED' ? ['publish'] : [];
  if (article.status !== 'ARCHIVED') actions.push('archive');
  return <>
    {actions.map(value => <button key={value} type="button" className="button-secondary" disabled={busy}
      onClick={event => { trigger.current = event.currentTarget; setError(null); setReason(''); setAction(value); }}>
      {labels[value]}
    </button>)}
    {action ? <dialog ref={dialog} className="admin-article-dialog" aria-labelledby={`action-${article.id}`}
      onCancel={event => { event.preventDefault(); close(); }}>
      <form onSubmit={event => { event.preventDefault(); void submit(); }}>
        <h2 id={`action-${article.id}`}>{labels[action]} bài viết</h2>
        <p>{article.title}</p>
        <p>{action === 'archive' ? 'Lưu trữ sẽ gỡ bài viết khỏi chế độ công khai.'
          : action === 'reject' ? 'Lý do sẽ được hiển thị cho tác giả. Phiên bản đã xuất bản được giữ nguyên.'
          : 'Nội dung đang làm việc sẽ trở thành phiên bản công khai mới.'}</p>
        {action === 'reject' ? <label>Lý do từ chối
          <textarea autoFocus maxLength={2000} value={reason} disabled={busy}
            aria-invalid={Boolean(error)} aria-describedby={error ? 'rejection-error' : undefined}
            onChange={event => setReason(event.target.value)} />
        </label> : null}
        {error ? <p id="rejection-error" role="alert">{error}</p> : null}
        <div className="admin-article-actions">
          <button type="button" className="button-secondary" disabled={busy} onClick={close}>Hủy</button>
          <button type="submit" className="button-primary" disabled={busy}>{busy ? 'Đang xử lý…' : 'Xác nhận'}</button>
        </div>
      </form>
    </dialog> : null}
  </>;
}
