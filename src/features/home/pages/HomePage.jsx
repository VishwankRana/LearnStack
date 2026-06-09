import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";

export function HomePage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero__panel">
          <h2 className="hero__title">Your personal knowledge vault</h2>
          <p className="hero__description">
            Organize, search, and explore your thoughts with AI-powered
            insights.
          </p>

          <div className="hero__actions">
            <Link className="button button--primary" to="/register">
              Create account
            </Link>
            <Link className="button button--secondary" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
