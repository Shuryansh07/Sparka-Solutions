import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useUiStore } from '../store/ui.store';
import Footer from './Footer';
import Header from './Header';

// The assistant isn't needed for first paint, so load its code once the browser is idle.
const ChatbotWidget = lazy(() => import('@/features/discovery/components/ChatbotWidget'));
const Toaster = lazy(() => import('@/components/ui/sonner').then((m) => ({ default: m.Toaster })));

function useWhenIdle() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const go = () => setReady(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(go, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(go, 1500);
    return () => clearTimeout(id);
  }, []);
  return ready;
}

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
  useScrollManagement();
  const idle = useWhenIdle();

  return (
    <>
      <a
        href="#main"
        className="fixed -top-16 left-3 z-[100] rounded-lg bg-spark px-4 py-2.5 font-semibold text-night no-underline transition-[top] focus:top-3"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      {idle && (
        <Suspense fallback={null}>
          <ChatbotWidget />
          <Toaster />
        </Suspense>
      )}
    </>
  );
}
