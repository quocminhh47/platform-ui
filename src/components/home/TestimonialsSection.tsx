import { SectionHeading } from '../common/SectionHeading';
import { HOME_TESTIMONIALS } from './home-content';

export function TestimonialsSection() {
  return (
    <section className="landing-section landing-testimonials" aria-labelledby="testimonials-heading">
      <div className="landing-container">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Phản hồi minh họa"
          title="Học viên nói gì về trải nghiệm học"
          description="Các trích dẫn dưới đây là nội dung demo để minh họa bố cục — không phải đánh giá đã xác minh."
        />
        <ul className="landing-testimonials-grid">
          {HOME_TESTIMONIALS.map((item) => (
            <li key={item.id}>
              <figure className="landing-testimonial-card">
                <blockquote>{item.quote}</blockquote>
                <figcaption>
                  <span className="landing-testimonial-role">{item.role}</span>
                  <span className="landing-testimonial-note">{item.note}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
