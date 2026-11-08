import { Link } from 'react-router-dom';
import type { Enrollment } from '../../enrollment/api/enrollments.api';

type WelcomeSectionProps = {
  name: string;
  enrollments?: Enrollment[] | null;
};

export function WelcomeSection({ name, enrollments }: WelcomeSectionProps) {
  const hasActive = (enrollments ?? []).some((e) => e.status === 'ACTIVE');
  const hasAny = (enrollments?.length ?? 0) > 0;

  return (
    <section className="dashboard-welcome" aria-labelledby="welcome-heading">
      <h1 id="welcome-heading">Chào mừng trở lại, {name}</h1>
      <p>
        {hasActive
          ? 'Tiếp tục lộ trình học tiếng Trung của bạn.'
          : hasAny
            ? <>Khám phá thêm khóa học hoặc mở <Link to="/my-courses">khóa học của tôi</Link>.</>
            : <>Duyệt <Link to="/courses">danh mục khóa học</Link> và ghi danh để bắt đầu học.</>}
      </p>
    </section>
  );
}
