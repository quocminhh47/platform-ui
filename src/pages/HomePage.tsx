import { API_BASE_URL } from '../api/client';

export function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 40 * 16 }}>
      <h1>LMS</h1>
      <p>Frontend scaffold is running. Auth UI and course catalog come next.</p>
      <p>
        API base URL: <code>{API_BASE_URL}</code>
      </p>
    </main>
  );
}
