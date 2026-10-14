import { Link } from 'react-router-dom';

export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-copy">
        <p className="home-hero-kicker">Học liệu tiếng Trung</p>
        <h1 id="home-hero-title">Luyện tập theo lộ trình, từ phát âm đến HSK</h1>
        <p>
          Xem các khóa học đã xuất bản, mở giáo trình, và tiếp tục từ trang chi tiết của từng khóa.
        </p>
        <Link className="home-hero-cta" to="/courses">
          Xem khóa học
        </Link>
      </div>
      <div className="home-hero-art" aria-hidden="true">
        <HeroMark />
      </div>
    </section>
  );
}

function HeroMark() {
  return (
    <svg viewBox="0 0 220 160" className="home-hero-svg">
      <rect x="18" y="28" width="120" height="104" rx="16" fill="#0b3b67" />
      <rect x="78" y="16" width="124" height="96" rx="16" fill="#f59e0b" />
      <rect x="96" y="36" width="88" height="10" rx="5" fill="#fff" />
      <rect x="96" y="56" width="64" height="8" rx="4" fill="#fff7ed" />
      <rect x="96" y="72" width="72" height="8" rx="4" fill="#fff7ed" />
      <circle cx="48" cy="78" r="18" fill="#38bdf8" />
    </svg>
  );
}
