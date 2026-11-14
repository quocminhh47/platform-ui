import { createElement, useMemo, type ReactNode } from 'react';

const allowedTags = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote',
  'strong', 'em', 'b', 'i', 'u', 's', 'a', 'img', 'figure', 'figcaption', 'pre', 'code', 'br', 'hr',
]);
const discardedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'template']);

function safeUrl(value: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value, document.baseURI);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

// Build React nodes from an inert document. Never insert unsaved preview HTML into the live DOM.
function renderNode(node: Node, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const element = node as Element;
  const tag = element.localName;
  if (discardedTags.has(tag)) return null;
  const children = Array.from(element.childNodes, renderNode);
  if (!allowedTags.has(tag)) return children;
  const props: Record<string, unknown> = { key };
  if (tag === 'a') {
    props.href = safeUrl(element.getAttribute('href'));
    props.rel = 'nofollow noopener noreferrer';
  }
  if (tag === 'img') {
    props.src = safeUrl(element.getAttribute('src'));
    if (!props.src) return null;
    props.alt = element.getAttribute('alt') ?? '';
    props.title = element.getAttribute('title') ?? undefined;
  }
  if (tag === 'ol' && /^\d+$/.test(element.getAttribute('start') ?? '')) {
    props.start = Number(element.getAttribute('start'));
  }
  return ['img', 'br', 'hr'].includes(tag)
    ? createElement(tag, props) : createElement(tag, props, ...children);
}

export function PublicArticleContent({ html }: { html: string }) {
  const content = useMemo(() => {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    return Array.from(parsed.body.childNodes, renderNode);
  }, [html]);
  return <div className="article-reader-content" data-testid="public-article-content">{content}</div>;
}
