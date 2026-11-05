import { CheckCircle2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useDiscoveryStore } from '../store/discovery.store';
import '../discovery.css';

const NEXT_STEPS = {
  talk: [
    ['We reach out', 'A Sparka representative contacts you to schedule a time that works.'],
    ['We talk', 'We listen to what you’re trying to accomplish - no forms, no pressure.'],
    ['We research options', 'We compare suitable products across manufacturers for your operation.'],
  ],
  default: [
    ['A person reviews it', 'A Sparka representative reviews what you shared.'],
    ['We recap together', 'We call or meet with you to confirm your needs - before any estimate or proposal.'],
    ['We research options', 'We compare suitable products across manufacturers and come back with recommendations.'],
  ],
};

export default function ConfirmationPage() {
  const receipt = useDiscoveryStore((s) => s.receipt);
  if (!receipt) return <Navigate to="/discovery" replace />;

  const steps = NEXT_STEPS[receipt.route] || NEXT_STEPS.default;
  const heard = receipt.heard.filter((l) => !l.startsWith('Route:') && !l.startsWith('Readiness:'));

  return (
    <section className="section confirm">
      <div className="container narrow">
        <div className="panel confirm__panel">
          <span className="confirm__icon" aria-hidden="true">
            <CheckCircle2 />
          </span>
          <span className="eyebrow eyebrow--teal">Thank you</span>
          <h1>We’ve got it from here.</h1>
          <p className="confirm__ref">
            Your reference: <strong>{receipt.reference}</strong>
          </p>

          <ol className="timeline">
            {steps.map(([title, text]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ol>

          <details className="confirm__details">
            <summary>What you shared</summary>
            <ul>
              {heard.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>

          <div className="offer__actions">
            <Link to="/" className="btn btn--primary">
              Back to home
            </Link>
            <Link to="/solutions" className="btn btn--ghost">
              Explore solutions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
