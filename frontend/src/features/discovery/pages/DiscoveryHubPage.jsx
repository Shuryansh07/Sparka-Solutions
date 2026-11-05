import { Bookmark, HelpCircle, Repeat, SkipForward, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import PathCards from '../components/PathCards';
import { useDiscoveryStore } from '../store/discovery.store';

const PROMISES = [
  { icon: SkipForward, text: 'Skip any question' },
  { icon: HelpCircle, text: 'Say “I’m not sure”' },
  { icon: Bookmark, text: 'Save and resume later' },
  { icon: Repeat, text: 'Switch paths any time' },
  { icon: UserRound, text: 'Ask for a person at any point' },
];

export default function DiscoveryHubPage() {
  const hasProgress = useDiscoveryStore((s) => s.hasProgress());
  const narrative = useDiscoveryStore((s) => s.narrative);
  const resumePath = narrative.trim() ? '/discovery/describe' : '/discovery/guide';

  return (
    <>
      <section className="disc-hero disc-hero--hub">
        <div className="container">
          <span className="eyebrow">Sparka Discovery</span>
          <h1>
            Let’s start with <span>your needs.</span>
          </h1>
          <p>Choose whichever way feels easiest. Every path reaches the same people and gets the same care.</p>
        </div>
      </section>

      <section className="section disc-hub">
        <div className="container">
          {hasProgress && (
            <div className="resume-banner">
              <div>
                <strong>Welcome back.</strong> You have a Discovery in progress on this device.
              </div>
              <Link to={resumePath} className="btn btn--primary btn--sm">
                Continue where you left off
              </Link>
            </div>
          )}
          <PathCards />
          <ul className="promises" aria-label="Your control">
            {PROMISES.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon aria-hidden="true" /> {text}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
