import { describe, expect, it } from 'vitest';
import {
  isAllowedEmbedIframeSrc,
  isDirectVideoMediaUrl,
  isSafeExternalLink,
  parseGoogleDocsDocumentId,
  parseGoogleDriveFileId,
  parseYouTubeVideoId,
  toGoogleDocsPreview,
  toGoogleDrivePreview,
  toYouTubeNocookieEmbed,
} from './externalContentUrl';

describe('parseYouTubeVideoId', () => {
  it('parses watch URLs', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('parses youtu.be URLs', () => {
    expect(parseYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('parses embed URLs', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('parses shorts URLs', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('rejects invalid video IDs and untrusted hosts', () => {
    expect(parseYouTubeVideoId('https://evil.example/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=tooshort')).toBeNull();
    expect(parseYouTubeVideoId('not-a-url')).toBeNull();
  });
});

describe('toYouTubeNocookieEmbed', () => {
  it('builds embed URLs without query parameters', () => {
    expect(toYouTubeNocookieEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    );
  });
});

describe('Google Drive and Docs', () => {
  it('normalizes Drive file URLs to preview', () => {
    const url = 'https://drive.google.com/file/d/abc123XYZ/view?usp=sharing';
    expect(parseGoogleDriveFileId(url)).toBe('abc123XYZ');
    expect(toGoogleDrivePreview(url)).toBe('https://drive.google.com/file/d/abc123XYZ/preview');
  });

  it('normalizes Docs document URLs to preview', () => {
    const url = 'https://docs.google.com/document/d/docId9AbC/edit?tab=t.0';
    expect(parseGoogleDocsDocumentId(url)).toBe('docId9AbC');
    expect(toGoogleDocsPreview(url)).toBe('https://docs.google.com/document/d/docId9AbC/preview');
  });

  it('rejects unrelated hosts', () => {
    expect(toGoogleDrivePreview('https://example.com/file/d/abc/view')).toBeNull();
    expect(toGoogleDocsPreview('https://example.com/document/d/abc/edit')).toBeNull();
  });
});

describe('isDirectVideoMediaUrl', () => {
  it('accepts direct MP4 URLs', () => {
    expect(isDirectVideoMediaUrl('https://cdn.example/algebra.mp4')).toBe(true);
  });

  it('rejects YouTube and Drive URLs', () => {
    expect(isDirectVideoMediaUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
    expect(isDirectVideoMediaUrl('https://drive.google.com/file/d/abc/view')).toBe(false);
  });
});

describe('isSafeExternalLink and embed allowlist', () => {
  it('allows http and https links', () => {
    expect(isSafeExternalLink('https://example.com/page')).toBe(true);
    expect(isSafeExternalLink('javascript:alert(1)')).toBe(false);
  });

  it('allows only known embed hosts for iframe src', () => {
    expect(isAllowedEmbedIframeSrc('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')).toBe(
      true,
    );
    expect(isAllowedEmbedIframeSrc('https://drive.google.com/file/d/x/preview')).toBe(true);
    expect(isAllowedEmbedIframeSrc('https://docs.google.com/document/d/x/preview')).toBe(true);
    expect(isAllowedEmbedIframeSrc('https://evil.example/embed/x')).toBe(false);
    expect(isAllowedEmbedIframeSrc('http://drive.google.com/file/d/x/preview')).toBe(false);
  });
});
