import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { API_BASE_URL } from '../services/api/client';

export function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <section className="home-page">
      <h1>LMS</h1>
      <p>
        Frontend architecture is in place. Authentication works against{' '}
        <code>{API_BASE_URL}</code>.
      </p>
      {isAuthenticated && user ? (
        <p>
          Signed in as <strong>{user.fullName}</strong> ({user.email}).
        </p>
      ) : (
        <p>
          <Link to="/login">Sign in</Link> or <Link to="/register">create an account</Link> to
          continue.
        </p>
      )}
    </section>
  );
}
