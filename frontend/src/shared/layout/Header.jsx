import { Menu, X } from 'lucide-react';
import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../data/site';
import { useUiStore } from '../store/ui.store';

function BrandMark({ hidden }) {
  return (
    <Link to="/" className={`brand${hidden ? ' brand--hidden' : ''}`} aria-label="Sparka Solutions home">
      <img src="/images/logo-mark.jpg" alt="" width="40" height="40" />
      <span className="brand__word">
        <strong>SPARKA</strong>
        <small>SOLUTIONS</small>
      </span>
    </Link>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const menuOpen = useUiStore((s) => s.menuOpen);
  const toggleMenu = useUiStore((s) => s.toggleMenu);
  const closeMenu = useUiStore((s) => s.closeMenu);
  const mastheadVisible = useUiStore((s) => s.mastheadVisible);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && closeMenu();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  const hideBrand = pathname === '/' && mastheadVisible && !menuOpen;

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <BrandMark hidden={hideBrand} />

        <nav className="nav" aria-label="Primary">
          {NAV_LINKS.map((l) =>
            // Hash links share the "/" pathname, so only real routes get an active state.
            l.to.includes('#') ? (
              <Link key={l.to} to={l.to} className="nav__link">
                {l.label}
              </Link>
            ) : (
              <NavLink key={l.to} to={l.to} className="nav__link" end>
                {l.label}
              </NavLink>
            )
          )}
          <Link to="/discovery" className="btn btn--primary btn--sm">
            Find Your Solution
          </Link>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={toggleMenu}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div id="mobile-nav" className={`mobile-nav${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
              {l.label}
            </Link>
          ))}
          <Link to="/discovery" className="btn btn--primary" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
            Find Your Solution
          </Link>
          <p className="mobile-nav__note">Prefer a person? Choose “Let’s Talk” any time.</p>
        </nav>
      </div>
    </header>
  );
}
