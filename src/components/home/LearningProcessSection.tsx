import { HOME_PROCESS_STEPS } from './home-content';
import { SectionHeading } from '../common/SectionHeading';

export function LearningProcessSection() {
  return (
    <section className="landing-section landing-process" aria-labelledby="process-heading">
      <div className="landing-container">
        <SectionHeading
          id="process-heading"
          eyebrow="Quy trình học"
          title="Bốn bước để bắt đầu"
        />
        <ol className="landing-process-list">
          {HOME_PROCESS_STEPS.map((step) => (
            <li key={step.step}>
              <article className="landing-process-card">
                <span className="landing-process-step">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
