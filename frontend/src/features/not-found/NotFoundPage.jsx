import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="page-hero">
      <div className="container">
        <span className="eyebrow">404</span>
        <h1>
          We couldn’t find <span>that page.</span>
        </h1>
        <p>It may have moved. Let’s get you back on track.</p>
        <div className="actions-row">
          <Link to="/" className="btn btn--primary">
            Go home
          </Link>
          <Link to="/discovery" className="btn btn--ghost-light">
            Start Discovery
          </Link>
        </div>
      </div>
    </section>
  );
}
