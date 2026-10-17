import { Link } from 'react-router-dom';

export function CallToActionSection() {
  return (
    <section className="landing-cta" aria-labelledby="cta-heading">
      <div className="landing-container landing-cta-inner">
        <h2 id="cta-heading">Sẵn sàng bắt đầu hành trình tiếng Trung?</h2>
        <p>
          Duyệt khóa học đã xuất bản hoặc tạo tài khoản để ghi danh và theo dõi tiến độ học của
          bạn.
        </p>
        <div className="landing-cta-actions">
          <Link className="landing-btn landing-btn-primary" to="/courses">
            Xem khóa học
          </Link>
          <Link className="landing-btn landing-btn-ghost-on-dark" to="/register">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </section>
  );
}
