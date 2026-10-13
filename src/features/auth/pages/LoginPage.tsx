import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <section className="auth-page">
      <h1>Sign in</h1>
      <p className="auth-lead">Use your LMS account to continue.</p>
      <LoginForm onSuccess={() => navigate('/', { replace: true })} />
      <p className="auth-switch">
        No account yet? <Link to="/register">Register</Link>
      </p>
    </section>
  );
}
