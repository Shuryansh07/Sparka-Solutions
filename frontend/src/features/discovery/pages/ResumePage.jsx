import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Notice from '../../../shared/components/Notice';
import { ROUTES } from '../lib/flow';
import { useDiscoveryStore } from '../store/discovery.store';
import '../discovery.css';

export default function ResumePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const resumeDraft = useDiscoveryStore((s) => s.resumeDraft);
  const [error, setError] = useState('');

  useEffect(() => {
    resumeDraft(token)
      .then((route) => navigate(ROUTES[route]?.path || '/discovery', { replace: true }))
      .catch((err) => setError(err.message));
  }, [token, resumeDraft, navigate]);

  return (
    <section className="section">
      <div className="container narrow">
        {error ? (
          <div className="panel stack">
            <h1 className="question__prompt">We couldn’t open that saved Discovery</h1>
            <Notice tone="error">{error}</Notice>
            <div className="offer__actions">
              <Link to="/discovery" className="btn btn--primary">
                Start a new Discovery
              </Link>
              <Link to="/discovery/talk" className="btn btn--ghost">
                Talk to a person
              </Link>
            </div>
          </div>
        ) : (
          <div className="panel panel--loading" aria-busy="true">
            <span className="spinner" /> Restoring your progress...
          </div>
        )}
      </div>
    </section>
  );
}
