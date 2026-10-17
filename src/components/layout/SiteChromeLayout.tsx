import { useEffect, useState, type ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

type SiteChromeLayoutProps = {
  children: ReactNode;
  mainClassName?: string;
};

export function SiteChromeLayout({ children, mainClassName = 'public-main' }: SiteChromeLayoutProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 320);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="public-layout">
      <SiteHeader />
      <main className={mainClassName} id="main-content">
        {children}
      </main>
      <SiteFooter />
      {showScrollTop ? (
        <button
          type="button"
          className="public-scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Lên đầu trang
        </button>
      ) : null}
    </div>
  );
}
