import { Link } from 'react-router-dom';
import { SITE_BRAND } from '../../config/site-brand';
import { HERO_CATEGORY_TABS } from './home-content';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80';

export function HeroSection() {
  return (
    <section className="landing-hero" aria-labelledby="landing-hero-title">
      <div className="landing-hero-bg" aria-hidden="true">
        <img src={HERO_IMAGE} alt="" />
      </div>
      <div className="landing-hero-overlay" aria-hidden="true" />
      <div className="landing-container landing-hero-body">
        <p className="landing-hero-badge">
          <span className="landing-hero-badge-dot" aria-hidden="true" />
          {SITE_BRAND.heroKicker}
        </p>
        <h1 id="landing-hero-title" className="landing-hero-title">
          Học tiếng Trung có lộ trình
          <span className="landing-hero-highlight">{SITE_BRAND.productName}</span>
        </h1>
        <p className="landing-hero-lead">
          Khóa học từ sơ cấp đến luyện thi HSK, kết hợp video, tài liệu và bài kiểm tra trên một
          nền tảng — phù hợp người bận rộn cần lịch học linh hoạt.
        </p>
        <div className="landing-hero-actions">
          <Link className="landing-btn landing-btn-primary" to="/courses">
            Khám phá khóa học
          </Link>
          <Link className="landing-btn landing-btn-ghost" to="/register">
            Tạo tài khoản miễn phí
          </Link>
        </div>
      </div>
      <div className="landing-hero-tabs" aria-label="Nhóm khóa học">
        <div className="landing-container landing-hero-tabs-grid">
          {HERO_CATEGORY_TABS.map((tab, index) => (
            <Link
              key={tab.id}
              to={tab.href}
              className={index === 0 ? 'landing-hero-tab is-active' : 'landing-hero-tab'}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
