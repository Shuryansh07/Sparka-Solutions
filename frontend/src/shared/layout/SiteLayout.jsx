import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useUiStore } from '../store/ui.store';
import Footer from './Footer';
import Header from './Header';
import Masthead from './Masthead';

function useScrollManagement() {
  const { pathname, hash } = useLocation();
  const closeMenu = useUiStore((s) => s.closeMenu);

  useEffect(() => {
    closeMenu();
    if (hash) {
      // Wait a frame so the target section has rendered after navigation.
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash, closeMenu]);
}

export default function SiteLayout() {
  const { pathname } = useLocation();
  const toast = useUiStore((s) => s.toast);
  useScrollManagement();

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {pathname === '/' && <Masthead />}
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 /> {toast}
        </div>
      )}
    </>
  );
}
