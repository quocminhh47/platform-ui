import { Link } from 'react-router-dom';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  const rootClass = className ? `app-breadcrumb ${className}` : 'app-breadcrumb';

  return (
    <nav className={rootClass} aria-label="Breadcrumb">
      <ol className="app-breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="app-breadcrumb-item">
              {isLast || !item.href ? (
                <span className="app-breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className="app-breadcrumb-link">
                  {item.label}
                </Link>
              )}
              {!isLast ? (
                <span className="app-breadcrumb-separator" aria-hidden="true">/</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
