import type { ReactNode } from 'react';

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeading({ id, eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="landing-section-heading">
      <div className="landing-section-heading-text">
        {eyebrow ? (
          <p className="landing-section-eyebrow">
            <span className="landing-section-eyebrow-mark" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h2 id={id} className="landing-section-title">{title}</h2>
        {description ? <p className="landing-section-description">{description}</p> : null}
      </div>
      {action ? <div className="landing-section-heading-action">{action}</div> : null}
    </div>
  );
}
