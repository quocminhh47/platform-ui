const UNAVAILABLE = [
  { label: 'Enrolled courses', note: 'Enrollment is not available yet' },
  { label: 'In progress', note: 'Progress is not available yet' },
  { label: 'Completed', note: 'Completion is not available yet' },
];

/**
 * Enrollment and lesson-progress APIs do not exist yet.
 * These cards stay unlabeled as numbers so they are not mistaken for real stats.
 */
export function LearningStats() {
  return (
    <section className="dashboard-section" aria-labelledby="stats-heading">
      <h2 id="stats-heading">Learning snapshot</h2>
      <ul className="stat-grid">
        {UNAVAILABLE.map((item) => (
          <li key={item.label} className="stat-card">
            <p className="stat-label">{item.label}</p>
            <p className="stat-value">Not available</p>
            <p className="muted">{item.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
