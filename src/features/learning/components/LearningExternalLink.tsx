import type { ReactNode } from 'react';
import { isSafeExternalLink } from '../utils/externalContentUrl';

type LearningExternalLinkProps = {
  href: string;
  children: ReactNode;
};

export function LearningExternalLink({ href, children }: LearningExternalLinkProps) {
  if (!isSafeExternalLink(href)) {
    return null;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
