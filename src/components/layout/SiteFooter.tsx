import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer-brand">LMS</p>
      <nav aria-label="Footer">
        <Link to="/">Home</Link>
        <Link to="/courses">Explore courses</Link>
      </nav>
    </footer>
  );
}
