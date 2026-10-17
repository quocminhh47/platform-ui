import { Link } from 'react-router-dom';
import { SectionHeading } from '../common/SectionHeading';
import { HOME_CATEGORIES } from './home-content';

export function CourseCategoriesSection() {
  return (
    <section className="landing-section landing-categories" aria-labelledby="categories-heading">
      <div className="landing-container">
        <SectionHeading
          id="categories-heading"
          eyebrow="Chương trình học"
          title="Lộ trình phù hợp mục tiêu của bạn"
          description="Chọn hướng học tiếng Trung theo trình độ và nhu cầu — từ giao tiếp hằng ngày đến thi chứng chỉ."
        />
        <ul className="landing-categories-grid">
          {HOME_CATEGORIES.map((category) => (
            <li key={category.id}>
              <Link to={category.href} className="landing-category-card">
                <h3>{category.label}</h3>
                <p>{category.description}</p>
                <span className="landing-category-cta">Xem khóa học</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
