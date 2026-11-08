/** Public article summary — matches {@code ArticlePublicSummaryResponse}. */
export type PublicArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  authorId: string;
  authorName: string;
  publishedAt: string;
};

/** Public article detail — matches {@code ArticlePublicDetailResponse}. */
export type PublicArticleDetail = PublicArticleSummary & {
  contentHtml: string;
};
