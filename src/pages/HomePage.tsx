import { Link } from 'react-router-dom';
import { SiteFooter } from '../components/layout/SiteFooter';
import { CourseListing } from '../features/catalog/components/CourseListing';
import { usePublishedCourses } from '../features/catalog/hooks/usePublishedCourses';

const BENEFITS = [
  {
    title: 'Published catalog',
    text: 'See courses an administrator has made available. Nothing here is a preview of unpublished work.',
  },
  {
    title: 'A student account',
    text: 'Register, sign in, and return to your dashboard with the same account.',
  },
  {
    title: 'Room to grow',
    text: 'Enrollment and progress will live alongside this catalog when those features are ready.',
  },
];

export function HomePage() {
  const courses = usePublishedCourses();

  return (
    <div className="marketing">
      <section className="hero" aria-labelledby="hero-heading">
        <p className="eyebrow">Learning platform</p>
        <h1 id="hero-heading">Build skills from a clear course catalog</h1>
        <p className="hero-lead">
          Browse published courses, create a student account, and come back to your dashboard
          whenever you are ready to continue.
        </p>
        <Link className="button-primary" to="/courses">
          Explore courses
        </Link>
      </section>

      <section className="marketing-section" aria-labelledby="featured-heading">
        <div className="section-heading">
          <h2 id="featured-heading">Featured courses</h2>
          <p className="muted">Published courses from the catalog.</p>
        </div>
        <CourseListing
          state={courses}
          limit={3}
          emptyTitle="No published courses yet"
          emptyDescription="When an administrator publishes a course, it will appear here."
        />
      </section>

      <section className="marketing-section" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading">Why this LMS</h2>
        <ul className="benefit-grid">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="benefit-card">
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="closing-cta" aria-labelledby="closing-heading">
        <h2 id="closing-heading">Ready to look through the catalog?</h2>
        <p>Every course listed there is published and available to browse.</p>
        <Link className="button-primary" to="/courses">
          Explore courses
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
