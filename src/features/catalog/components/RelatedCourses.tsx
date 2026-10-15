import { CourseListing } from './CourseListing';
import { usePublishedCourses } from '../hooks/usePublishedCourses';

type RelatedCoursesProps = {
  courseId: string;
};

export function RelatedCourses({ courseId }: RelatedCoursesProps) {
  const state = usePublishedCourses();
  const others = state.courses?.filter((course) => course.id !== courseId) ?? null;

  return (
    <section className="course-related" aria-labelledby="related-heading">
      <h2 id="related-heading">More courses</h2>
      <CourseListing
        state={{ ...state, courses: state.courses ? others : null }}
        emptyTitle="No other published courses"
        emptyDescription="More courses will appear here when they are published."
        limit={3}
      />
    </section>
  );
}
