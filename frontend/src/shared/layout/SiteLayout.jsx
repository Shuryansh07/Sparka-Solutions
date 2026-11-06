import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ChatbotWidget from '@/features/discovery/components/ChatbotWidget';
import { useUiStore } from '../store/ui.store';
import Footer from './Footer';
import Header from './Header';

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
      <ChatbotWidget />
      <Toaster />
    </>
  );
}
