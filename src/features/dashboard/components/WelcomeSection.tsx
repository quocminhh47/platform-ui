import { Link } from 'react-router-dom';

type WelcomeSectionProps = {
  name: string;
};

export function WelcomeSection({ name }: WelcomeSectionProps) {
  return (
    <section className="dashboard-welcome" aria-labelledby="welcome-heading">
      <h1 id="welcome-heading">Welcome back, {name}</h1>
      <p>
        Browse the <Link to="/courses">course catalog</Link>, or check back when your enrollments
        are ready.
      </p>
    </section>
  );
}
