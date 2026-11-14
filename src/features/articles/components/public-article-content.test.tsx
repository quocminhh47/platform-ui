import { render, screen } from '@testing-library/react';
import { PublicArticleContent } from './PublicArticleContent';
import { ArticleEditorPreview } from './ArticleEditorPreview';

const attack = '<p onclick="alert(1)">Safe<u>underline</u><s>strike</s></p><img src="https://example.com/x" onerror="alert(1)"><a href="jav&#x61;script:alert(1)">Bad</a><svg onload="alert(1)"></svg><iframe srcdoc="evil"></iframe><script>alert(1)</script>';
it('renders safe formatting without executable markup in public content', () => {
  const { container } = render(<PublicArticleContent html={attack} />);
  expect(container.querySelector('u')?.textContent).toBe('underline');
  expect(container.querySelector('s')?.textContent).toBe('strike');
  expect(container.querySelector('script,svg,iframe,[onclick],[onerror]')).toBeNull();
  expect(screen.getByText('Bad').getAttribute('href')).toBeNull();
});
it('applies the same policy to unsaved previews and rejects unsafe image schemes', () => {
  const { container } = render(<ArticleEditorPreview title="Preview" excerpt="" featuredImageUrl="" contentHtml={attack + '<img src="data:text/html,evil"><img src="javascript:alert(1)">'} />);
  expect(container.querySelectorAll('img')).toHaveLength(1);
  expect(container.querySelector('[onerror],script,svg,iframe')).toBeNull();
});
