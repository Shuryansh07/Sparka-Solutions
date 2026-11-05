import { ArrowRight, Compass, Headset, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/flow';
import '../discovery.css';

const PATHS = [
  {
    key: 'guide',
    icon: Compass,
    meta: '3-5 questions • about 2-4 minutes',
    text: 'Answer a few quick, adaptive questions. Skip anything or say “I’m not sure.”',
    cta: 'Start guided Discovery',
  },
  {
    key: 'describe',
    icon: PenLine,
    meta: 'Your words • no questionnaire',
    text: 'Describe what you need in your own words. We’ll organize it for you to confirm.',
    cta: 'Describe your needs',
  },
  {
    key: 'talk',
    icon: Headset,
    meta: 'Phone or video • no forms first',
    text: 'Prefer a conversation? Request a call or video consultation with a Sparka representative.',
    cta: 'Talk to a person',
  },
];

export default function PathCards() {
  return (
    <div className="path-cards">
      {PATHS.map(({ key, icon: Icon, meta, text, cta }) => (
        <Link key={key} to={ROUTES[key].path} className="path-card">
          <span className="path-card__icon" aria-hidden="true">
            <Icon />
          </span>
          <span className="path-card__meta">{meta}</span>
          <h3>{ROUTES[key].label}</h3>
          <p>{text}</p>
          <span className="path-card__cta">
            {cta} <ArrowRight aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}
