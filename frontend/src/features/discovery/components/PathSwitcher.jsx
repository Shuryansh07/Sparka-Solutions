import { NavLink } from 'react-router-dom';
import { ROUTES } from '../lib/flow';

export default function PathSwitcher() {
  return (
    <nav className="path-switcher" aria-label="Choose how to start">
      {Object.entries(ROUTES).map(([key, r]) => (
        <NavLink key={key} to={r.path} className="path-switcher__tab">
          <span className="path-switcher__long">{r.label}</span>
          <span className="path-switcher__short">{r.short}</span>
        </NavLink>
      ))}
    </nav>
  );
}
