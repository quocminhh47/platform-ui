export type ArticleExtractionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type ArticleSnapshot = {
  sourceUrl: string | null;
  extractedTitle: string | null;
  author: string | null;
  publishedAt: string | null;
  featuredImageUrl: string | null;
  contentHtml: string | null;
  extractionStatus: ArticleExtractionStatus | null;
  extractedAt: string | null;
  extractionError?: string | null;
};
