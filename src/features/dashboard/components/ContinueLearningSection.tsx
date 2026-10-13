import { EmptyState } from './EmptyState';

export function ContinueLearningSection() {
  return (
    <section className="dashboard-section" aria-labelledby="continue-heading">
      <h2 id="continue-heading">Continue learning</h2>
      <EmptyState
        title="Nothing to continue yet"
        description="Course progress is not available yet, so there is no lesson to resume."
      />
    </section>
  );
}
