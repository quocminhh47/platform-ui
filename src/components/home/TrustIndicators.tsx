import { HOME_TRUST_ITEMS } from './home-content';

export function TrustIndicators() {
  return (
    <section className="landing-trust" aria-label="Điểm nổi bật">
      <div className="landing-container landing-trust-grid">
        {HOME_TRUST_ITEMS.map((item) => (
          <article key={item.title} className="landing-trust-card">
            <h2 className="landing-trust-title">{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
