/** Matches backend {@code ArticleStatus}. */
export type ArticleStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

/** Matches backend {@code ArticleManageResponse}. */
export type ManageArticle = {
  id: string;
  slug: string;
  status: ArticleStatus;
  authorId: string;
  authorName: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  contentHtml: string;
  publishedTitle: string | null;
  publishedExcerpt: string | null;
  publishedFeaturedImageUrl: string | null;
  publishedContentHtml: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArticleWriteBody = {
  title: string;
  excerpt?: string | null;
  contentHtml: string;
  featuredImageUrl?: string | null;
  publishImmediately?: boolean;
};
