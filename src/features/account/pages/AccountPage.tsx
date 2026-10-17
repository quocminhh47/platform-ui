import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { breadcrumbAccount, breadcrumbHome } from '../../../navigation/breadcrumb-trail';
import { useAuth } from '../../auth/hooks/useAuth';

export function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="account-page landing-container">
      <Breadcrumb items={[breadcrumbHome(), breadcrumbAccount()]} />
      <section className="account-panel" aria-labelledby="account-heading">
        <h1 id="account-heading">Hồ sơ cá nhân</h1>
        <dl className="account-details">
          <div>
            <dt>Họ tên</dt>
            <dd>{user.fullName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Vai trò</dt>
            <dd>{user.role}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
