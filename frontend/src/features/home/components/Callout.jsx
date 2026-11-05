import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Callout() {
  return (
    <section className="callout">
      <div className="container">
        <span className="eyebrow">Let’s Start With Your Needs</span>
        <h2>Tell us what you’re trying to accomplish.</h2>
        <p>Answer a few questions about your fleet. We’ll use your answers to begin exploring suitable options.</p>
        <div className="callout__actions">
          <Link to="/discovery" className="btn btn--primary">
            Start Discovery <ArrowRight />
          </Link>
          <Link to="/discovery/talk" className="btn btn--ghost-light">
            Talk to a person
          </Link>
        </div>
      </div>
    </section>
  );
}
