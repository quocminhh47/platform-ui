import { SiteFooter } from '../../../components/layout/SiteFooter';
import { CourseListing } from '../components/CourseListing';
import { usePublishedCourses } from '../hooks/usePublishedCourses';

export function CatalogPage() {
  const courses = usePublishedCourses();

  return (
    <div className="marketing">
      <section className="catalog-intro" aria-labelledby="catalog-heading">
        <p className="eyebrow">Catalog</p>
        <h1 id="catalog-heading">Explore courses</h1>
        <p className="hero-lead">These are the courses currently published in the catalog.</p>
      </section>

      <section className="marketing-section" aria-labelledby="catalog-list-heading">
        <h2 id="catalog-list-heading" className="visually-hidden">
          Published courses
        </h2>
        <CourseListing
          state={courses}
          emptyTitle="No published courses"
          emptyDescription="When an administrator publishes a course, it will appear here."
        />
      </section>

      <SiteFooter />
    </div>
  );
}
