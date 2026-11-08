export type ArticleEditorValues = {
  title: string;
  excerpt: string;
  featuredImageUrl: string;
  contentHtml: string;
};

export type ArticleEditorFieldErrors = Partial<Record<keyof ArticleEditorValues, string>>;

export type ArticleEditorValidation = {
  fieldErrors: ArticleEditorFieldErrors;
  formError: string | null;
};

const MAX_TITLE = 500;
const MAX_FEATURED_URL = 2048;

export function hasMeaningfulHtmlContent(html: string): boolean {
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length > 0;
  }
  const text = document.createElement('div');
  text.innerHTML = html;
  return (text.textContent ?? '').replace(/\s+/g, ' ').trim().length > 0;
}

export function validateFeaturedImageUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length > MAX_FEATURED_URL) {
    return `URL ảnh bìa tối đa ${MAX_FEATURED_URL} ký tự.`;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'URL ảnh bìa phải dùng http hoặc https.';
    }
  } catch {
    return 'URL ảnh bìa không hợp lệ.';
  }
  return null;
}

export function validateArticleEditor(
  values: ArticleEditorValues,
  options: { requireRichContent: boolean },
): ArticleEditorValidation {
  const fieldErrors: ArticleEditorFieldErrors = {};
  const title = values.title.trim();
  if (!title) {
    fieldErrors.title = 'Tiêu đề không được để trống.';
  } else if (title.length > MAX_TITLE) {
    fieldErrors.title = `Tiêu đề tối đa ${MAX_TITLE} ký tự.`;
  }

  const imageError = validateFeaturedImageUrl(values.featuredImageUrl);
  if (imageError) {
    fieldErrors.featuredImageUrl = imageError;
  }

  if (options.requireRichContent && !hasMeaningfulHtmlContent(values.contentHtml)) {
    fieldErrors.contentHtml = 'Nội dung bài viết phải có văn bản.';
  }

  return {
    fieldErrors,
    formError:
      Object.keys(fieldErrors).length > 0 ? 'Vui lòng sửa các lỗi trong biểu mẫu.' : null,
  };
}

export function buildArticleWriteBody(
  values: ArticleEditorValues,
  publishImmediately?: boolean,
): {
  title: string;
  excerpt: string | null;
  contentHtml: string;
  featuredImageUrl: string | null;
  publishImmediately?: boolean;
} {
  const excerpt = values.excerpt.trim();
  const featuredImageUrl = values.featuredImageUrl.trim();
  return {
    title: values.title.trim(),
    excerpt: excerpt ? excerpt : null,
    contentHtml: values.contentHtml,
    featuredImageUrl: featuredImageUrl ? featuredImageUrl : null,
    ...(publishImmediately !== undefined ? { publishImmediately } : {}),
  };
}
