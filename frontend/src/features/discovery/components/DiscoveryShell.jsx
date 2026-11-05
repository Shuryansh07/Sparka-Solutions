import { Headset, Lock, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDiscoveryStore } from '../store/discovery.store';
import PathSwitcher from './PathSwitcher';
import SaveForLater from './SaveForLater';
import '../discovery.css';

export default function DiscoveryShell({ route, title, intro, children }) {
  const clearError = useDiscoveryStore((s) => s.clearError);
  const setFieldErrors = useDiscoveryStore((s) => s.setFieldErrors);

  useEffect(() => {
    clearError();
    setFieldErrors({});
  }, [route, clearError, setFieldErrors]);

  return (
    <>
      <section className="disc-hero">
        <div className="container">
          <span className="eyebrow">Sparka Discovery</span>
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
          <PathSwitcher />
        </div>
      </section>

      <section className="disc-body">
        <div className="container disc-layout">
          <div className="disc-main">{children}</div>

          <aside className="disc-aside" aria-label="Help">
            {route !== 'talk' && (
              <div className="aside-card aside-card--dark">
                <Headset aria-hidden="true" />
                <h3>Prefer a person?</h3>
                <p>You can switch to a conversation at any point - nothing you’ve shared is lost.</p>
                <Link to="/discovery/talk" className="btn btn--gold btn--sm btn--block">
                  Talk to a person
                </Link>
              </div>
            )}

            {route !== 'talk' && (
              <div className="aside-card">
                <h3>Not ready to finish?</h3>
                <p>Your answers are kept on this device. Save a link to resume anywhere.</p>
                <SaveForLater route={route} />
              </div>
            )}

            <ul className="aside-assurances">
              <li>
                <ShieldCheck aria-hidden="true" /> No proposal is sent until a representative has spoken with you.
              </li>
              <li>
                <Lock aria-hidden="true" /> We only use what you share to help with your request.{' '}
                <Link to="/privacy">Privacy</Link>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
