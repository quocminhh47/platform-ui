import { UI_COPY } from '../../../ui/ui-copy';

const UNAVAILABLE = [
  { label: 'Khóa đã ghi danh', note: 'Thống kê ghi danh sẽ hiển thị khi có dữ liệu.' },
  { label: 'Đang học', note: 'Tiến độ học sẽ hiển thị khi có dữ liệu.' },
  { label: UI_COPY.completed, note: 'Số khóa hoàn thành sẽ hiển thị khi có dữ liệu.' },
];

/**
 * Enrollment and lesson-progress APIs do not exist yet.
 * These cards stay unlabeled as numbers so they are not mistaken for real stats.
 */
export function LearningStats() {
  return (
    <section className="dashboard-section" aria-labelledby="stats-heading">
      <h2 id="stats-heading">Tổng quan học tập</h2>
      <ul className="stat-grid">
        {UNAVAILABLE.map((item) => (
          <li key={item.label} className="stat-card">
            <p className="stat-label">{item.label}</p>
            <p className="stat-value">{UI_COPY.notAvailable}</p>
            <p className="muted">{item.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
