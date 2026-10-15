/** YouTube video IDs are 11 characters (unpadded base64url-style alphabet). */
const YOUTUBE_VIDEO_ID = /^[\w-]{11}$/;

const DIRECT_VIDEO_PATH = /\.(mp4|webm|ogg|m4v|mov)(\?|#|$)/i;

const NON_DIRECT_VIDEO_HOST_SUFFIXES = [
  'youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'drive.google.com',
  'docs.google.com',
  'vimeo.com',
  'dailymotion.com',
];

/**
 * HTTP(S) URLs safe to offer as an external link (not for iframe src).
 */
export function isSafeExternalLink(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isAllowedEmbedIframeSrc(src: string): boolean {
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') {
      return false;
    }
    const host = url.hostname.toLowerCase();
    return (
      host === 'www.youtube-nocookie.com' ||
      host === 'drive.google.com' ||
      host === 'docs.google.com'
    );
  } catch {
    return false;
  }
}

export function parseYouTubeVideoId(contentUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(contentUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const bareHost = host.startsWith('www.') ? host.slice(4) : host;

  if (bareHost === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0] ?? '';
    return YOUTUBE_VIDEO_ID.test(id) ? id : null;
  }

  if (
    bareHost === 'youtube.com' ||
    bareHost === 'youtube-nocookie.com' ||
    bareHost === 'm.youtube.com'
  ) {
    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v') ?? '';
      return YOUTUBE_VIDEO_ID.test(id) ? id : null;
    }
    const embed = url.pathname.match(/^\/embed\/([\w-]{11})$/);
    if (embed) {
      return embed[1];
    }
    const shorts = url.pathname.match(/^\/shorts\/([\w-]{11})$/);
    if (shorts) {
      return shorts[1];
    }
    const legacy = url.pathname.match(/^\/v\/([\w-]{11})$/);
    if (legacy) {
      return legacy[1];
    }
  }

  return null;
}

/** Supported YouTube entry URLs → privacy-enhanced embed (no extra query params). */
export function toYouTubeNocookieEmbed(contentUrl: string): string | null {
  const id = parseYouTubeVideoId(contentUrl);
  if (!id) {
    return null;
  }
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function parseGoogleDriveFileId(contentUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(contentUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return null;
  }
  if (url.hostname.toLowerCase() !== 'drive.google.com') {
    return null;
  }
  const match = url.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function toGoogleDrivePreview(contentUrl: string): string | null {
  const id = parseGoogleDriveFileId(contentUrl);
  if (!id) {
    return null;
  }
  return `https://drive.google.com/file/d/${id}/preview`;
}

export function parseGoogleDocsDocumentId(contentUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(contentUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return null;
  }
  if (url.hostname.toLowerCase() !== 'docs.google.com') {
    return null;
  }
  const match = url.pathname.match(/^\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function toGoogleDocsPreview(contentUrl: string): string | null {
  const id = parseGoogleDocsDocumentId(contentUrl);
  if (!id) {
    return null;
  }
  return `https://docs.google.com/document/d/${id}/preview`;
}

/**
 * True for direct media URLs (e.g. MP4 on a CDN). YouTube and other embed-only
 * hosts are excluded so the player can show a link fallback instead.
 */
export function isDirectVideoMediaUrl(contentUrl: string): boolean {
  if (!isSafeExternalLink(contentUrl)) {
    return false;
  }
  if (parseYouTubeVideoId(contentUrl)) {
    return false;
  }
  let url: URL;
  try {
    url = new URL(contentUrl);
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase();
  if (NON_DIRECT_VIDEO_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) {
    return false;
  }
  return DIRECT_VIDEO_PATH.test(url.pathname);
}
