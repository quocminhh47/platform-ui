import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <section className="auth-page">
      <h1>Create account</h1>
      <p className="auth-lead">Public registration creates a student account.</p>
      <RegisterForm onSuccess={() => navigate('/', { replace: true })} />
      <p className="auth-switch">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </section>
  );
}
