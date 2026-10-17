import { SectionHeading } from '../common/SectionHeading';
import { HOME_REASONS } from './home-content';

export function WhyChooseUsSection() {
  return (
    <section
      className="landing-section landing-why"
      id="why-choose"
      aria-labelledby="why-choose-heading"
    >
      <div className="landing-container">
        <SectionHeading
          id="why-choose-heading"
          eyebrow="Lý do chọn trung tâm"
          title="Học tiếng Trung bài bản, thực tế"
        />
        <ul className="landing-why-grid">
          {HOME_REASONS.map((reason) => (
            <li key={reason.title}>
              <article className="landing-why-card">
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
