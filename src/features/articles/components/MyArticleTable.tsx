import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatArticleDate } from '../utils/formatArticleDate';
import { confirmArticleSubmit } from '../utils/confirm-article-submit';
import {
  articleStatusBadgeClass,
  articleStatusLabel,
} from '../utils/article-status-labels';
import type { ManageArticle } from '../types/manage-article.types';

type MyArticleTableProps = {
  articles: ManageArticle[];
  busyId: string | null;
  onSubmit: (article: ManageArticle) => Promise<void>;
};

export function MyArticleTable({ articles, busyId, onSubmit }: MyArticleTableProps) {
  const inFlightRef = useRef<string | null>(null);
  const [localBusy, setLocalBusy] = useState<string | null>(null);

  async function handleSubmit(article: ManageArticle) {
    if (inFlightRef.current || busyId) {
      return;
    }
    if (!confirmArticleSubmit(article.title)) {
      return;
    }
    inFlightRef.current = article.id;
    setLocalBusy(article.id);
    try {
      await onSubmit(article);
    } finally {
      inFlightRef.current = null;
      setLocalBusy(null);
    }
  }

  const effectiveBusy = busyId ?? localBusy;

  return (
    <div className="admin-table-wrap my-articles-table-wrap">
      <table className="admin-table my-articles-table">
        <caption className="visually-hidden">Bài viết của tôi</caption>
        <thead>
          <tr>
            <th scope="col">Bài viết</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">Cập nhật</th>
            <th scope="col">Xuất bản</th>
            <th scope="col" className="admin-table-actions">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <MyArticleRow
              key={article.id}
              article={article}
              busy={effectiveBusy === article.id}
              onSubmit={() => handleSubmit(article)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MyArticleRow({
  article,
  busy,
  onSubmit,
}: {
  article: ManageArticle;
  busy: boolean;
  onSubmit: () => void;
}) {
  const updated = formatArticleDate(article.updatedAt);
  const published = formatArticleDate(article.publishedAt);
  const thumb = article.featuredImageUrl?.trim() || article.publishedFeaturedImageUrl?.trim();
  const showPublic =
    article.publishedAt && article.slug && article.status !== 'ARCHIVED';

  return (
    <tr className={article.status === 'REJECTED' ? 'my-articles-row--rejected' : undefined}>
      <td data-label="Bài viết">
        <div className="my-articles-title-cell">
          {thumb ? (
            <img className="my-articles-thumb" src={thumb} alt="" loading="lazy" />
          ) : (
            <div className="my-articles-thumb my-articles-thumb--placeholder" aria-hidden="true" />
          )}
          <div>
            <p className="admin-table-title">{article.title}</p>
            {article.status === 'REJECTED' && article.rejectionReason ? (
              <p className="my-articles-rejection" role="alert">
                Lý do từ chối: {article.rejectionReason}
              </p>
            ) : null}
          </div>
        </div>
      </td>
      <td data-label="Trạng thái">
        <span className={articleStatusBadgeClass(article.status)}>
          {articleStatusLabel(article.status)}
        </span>
      </td>
      <td data-label="Cập nhật">{updated ?? '—'}</td>
      <td data-label="Xuất bản">{published ?? '—'}</td>
      <td data-label="Thao tác" className="admin-table-actions">
        <MyArticleActions
          article={article}
          busy={busy}
          showPublic={Boolean(showPublic)}
          onSubmit={onSubmit}
        />
      </td>
    </tr>
  );
}

function MyArticleActions({
  article,
  busy,
  showPublic,
  onSubmit,
}: {
  article: ManageArticle;
  busy: boolean;
  showPublic: boolean;
  onSubmit: () => void;
}) {
  const editHref = `/articles/edit/${article.id}`;

  switch (article.status) {
    case 'DRAFT':
      return (
        <>
          <Link className="button-secondary my-articles-action" to={editHref}>
            Chỉnh sửa
          </Link>
          <button
            type="button"
            className="button-primary my-articles-action"
            disabled={busy}
            onClick={onSubmit}
          >
            {busy ? 'Đang gửi…' : 'Gửi duyệt'}
          </button>
        </>
      );
    case 'PENDING_REVIEW':
      return (
        <Link className="button-secondary my-articles-action" to={editHref}>
          Xem chi tiết
        </Link>
      );
    case 'PUBLISHED':
      return (
        <>
          <Link className="button-primary my-articles-action" to={editHref}>
            Chỉnh sửa
          </Link>
          {showPublic ? (
            <Link className="button-secondary my-articles-action" to={`/articles/${article.slug}`}>
              Xem công khai
            </Link>
          ) : null}
        </>
      );
    case 'REJECTED':
      return (
        <>
          <Link className="button-secondary my-articles-action" to={editHref}>
            Chỉnh sửa
          </Link>
          <button
            type="button"
            className="button-primary my-articles-action"
            disabled={busy}
            onClick={onSubmit}
          >
            {busy ? 'Đang gửi…' : 'Gửi lại duyệt'}
          </button>
        </>
      );
    case 'ARCHIVED':
      return (
        <Link className="button-secondary my-articles-action" to={editHref}>
          Xem
        </Link>
      );
    default:
      return null;
  }
}
