import { Link } from 'react-router-dom';
import { TAGLINE } from '../data/site';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Link to="/" className="brand" aria-label="Sparka Solutions home">
            <img src="/images/logo-mark.jpg" alt="" width="40" height="40" />
            <span className="brand__word">
              <strong>SPARKA</strong>
              <small>SOLUTIONS</small>
            </span>
          </Link>
          <p className="site-footer__tagline">{TAGLINE.toUpperCase()}</p>
          <p>Manufacturer-independent fleet products, technology and sourcing - backed by people who listen first.</p>
        </div>

        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/solutions">Solutions</Link></li>
            <li><Link to="/#how">How It Works</Link></li>
            <li><Link to="/#about">About</Link></li>
          </ul>
        </div>

        <div>
          <h4>Get Started</h4>
          <ul>
            <li><Link to="/discovery/guide">Guide Me</Link></li>
            <li><Link to="/discovery/describe">Tell Us What You Need</Link></li>
            <li><Link to="/discovery/talk">Let’s Talk</Link></li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Sparka Solutions. All rights reserved.</span>
        <span>Sparka Fleet - a division of Sparka Solutions</span>
      </div>
    </footer>
  );
}
