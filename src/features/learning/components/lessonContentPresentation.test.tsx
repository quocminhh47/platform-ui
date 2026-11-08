import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArticleLesson } from './ArticleLesson';
import { ArticleReader } from './ArticleReader';
import { VideoLesson } from './VideoLesson';

describe('VideoLesson', () => {
  it('renders an in-page YouTube embed for watch URLs', () => {
    render(
      <VideoLesson
        title="Intro"
        contentUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      />,
    );

    const iframe = document.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(document.querySelector('video')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders native video for direct MP4 URLs', () => {
    render(<VideoLesson title="Clip" contentUrl="https://cdn.example/lesson.mp4" />);

    const video = document.querySelector('video');
    expect(video?.getAttribute('src')).toBe('https://cdn.example/lesson.mp4');
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('shows a fallback link for unsupported video URLs', () => {
    render(<VideoLesson title="Other" contentUrl="https://vimeo.com/123456789" />);

    expect(document.querySelector('iframe')).toBeNull();
    expect(document.querySelector('video')).toBeNull();
    expect(screen.getByText(/cannot be played inside the lesson page/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open video externally' }).getAttribute('href')).toBe(
      'https://vimeo.com/123456789',
    );
  });
});

describe('ArticleReader', () => {
  it('renders sanitized article metadata and body', () => {
    render(
      <ArticleReader
        lessonTitle="Lesson"
        article={{
          sourceUrl: 'https://example.com/post',
          extractedTitle: 'Article headline',
          author: 'Author A',
          publishedAt: '2025-06-01T00:00:00Z',
          featuredImageUrl: 'https://cdn.example/hero.jpg',
          contentHtml: '<p>Body text</p>',
          extractionStatus: 'SUCCESS',
          extractedAt: '2025-06-02T00:00:00Z',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Article headline' })).toBeTruthy();
    expect(screen.getByText(/Tác giả: Author A/)).toBeTruthy();
    expect(screen.getByTestId('article-reader-content').innerHTML).toContain('Body text');
    expect(screen.getByRole('link', { name: 'Xem bài gốc' }).getAttribute('href')).toBe(
      'https://example.com/post',
    );
  });
});

describe('ArticleLesson', () => {
  it('renders Drive preview first with a secondary external link', () => {
    const url = 'https://drive.google.com/file/d/abc123XYZ/view';
    render(<ArticleLesson title="Handout" contentUrl={url} />);

    const iframe = document.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBe('https://drive.google.com/file/d/abc123XYZ/preview');
    const link = screen.getByRole('link', { name: 'Mở trên Google Drive' });
    expect(link.getAttribute('href')).toBe(url);
    expect(link.closest('.learning-external-fallback-secondary')).toBeTruthy();
  });

  it('renders Docs preview in-page', () => {
    render(
      <ArticleLesson
        title="Doc"
        contentUrl="https://docs.google.com/document/d/docId9AbC/edit"
      />,
    );

    expect(document.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://docs.google.com/document/d/docId9AbC/preview',
    );
  });

  it('uses the native reader for extracted external articles', () => {
    render(
      <ArticleLesson
        title="Web page"
        contentUrl="https://example.com/article.html"
        article={{
          sourceUrl: 'https://example.com/article.html',
          extractedTitle: 'Story',
          author: null,
          publishedAt: null,
          featuredImageUrl: null,
          contentHtml: '<p>Extracted</p>',
          extractionStatus: 'SUCCESS',
          extractedAt: null,
        }}
      />,
    );

    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.getByTestId('article-reader-content').innerHTML).toContain('Extracted');
  });

  it('shows pending state for articles still extracting', () => {
    render(
      <ArticleLesson
        title="Web page"
        contentUrl="https://example.com/article.html"
        article={{
          sourceUrl: 'https://example.com/article.html',
          extractedTitle: null,
          author: null,
          publishedAt: null,
          featuredImageUrl: null,
          contentHtml: null,
          extractionStatus: 'PENDING',
          extractedAt: null,
        }}
      />,
    );

    expect(screen.getByText(/Đang trích xuất/)).toBeTruthy();
  });
});
