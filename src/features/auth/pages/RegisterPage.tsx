import { Link, useLocation } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
  const location = useLocation();

  return (
    <section className="auth-page">
      <h1>Create account</h1>
      <p className="auth-lead">Public registration creates a student account.</p>
      {/* Redirect after success is handled by GuestRoute. */}
      <RegisterForm />
      <p className="auth-switch">
        Already registered?{' '}
        <Link to="/login" state={location.state}>
          Sign in
        </Link>
      </p>
    </section>
  );
}
