import { ArrowUpRight, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '../data/site';
import { useUiStore } from '../store/ui.store';
import Brand from './Brand';

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

function DesktopNav() {
  const { pathname, hash } = useLocation();
  const [hovered, setHovered] = useState(null);

  const isActive = (to) => (to.includes('#') ? pathname === '/' && hash === to.slice(1) : pathname === to);
  const active = NAV_LINKS.find((l) => isActive(l.to))?.to;
  const highlight = hovered ?? active;

  return (
    <nav aria-label="Primary" className="hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
      <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
        {NAV_LINKS.map((l) => {
          const Comp = l.to.includes('#') ? Link : NavLink;
          return (
            <li key={l.to} className="relative">
              {highlight === l.to && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/10"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <Comp
                to={l.to}
                {...(Comp === NavLink ? { end: true } : {})}
                onMouseEnter={() => setHovered(l.to)}
                onFocus={() => setHovered(l.to)}
                aria-current={isActive(l.to) ? 'page' : undefined}
                className={cn(
                  'relative z-10 block rounded-full px-4 py-1.5 text-[13.5px] font-medium no-underline transition-colors',
                  isActive(l.to) ? 'text-white' : 'text-white/65 hover:text-white'
                )}
              >
                {l.label}
              </Comp>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileNav() {
  const menuOpen = useUiStore((s) => s.menuOpen);
  const setMenuOpen = useUiStore((s) => s.setMenuOpen);
  const closeMenu = useUiStore((s) => s.closeMenu);

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="outline-light" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="border-white/10 bg-night px-6 pt-20 text-white">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>
        <nav aria-label="Mobile" className="flex flex-col">
          {NAV_LINKS.map((l, i) => (
            <motion.div
              key={l.to}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={l.to}
                onClick={closeMenu}
                className="type-wide flex items-center justify-between border-b border-white/10 py-4 text-2xl font-bold text-white no-underline"
              >
                {l.label}
                <ArrowUpRight className="size-5 text-white/40" />
              </Link>
            </motion.div>
          ))}
        </nav>
        <Button asChild variant="spark" size="lg" className="mt-6 w-full">
          <Link to="/discovery" onClick={closeMenu}>
            Find your solution
          </Link>
        </Button>
        <p className="text-center text-sm text-white/55">Prefer a person? Choose “Let’s Talk” any time.</p>
      </SheetContent>
    </Sheet>
  );
}

export default function Header() {
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 text-white transition-[background-color,border-color,box-shadow] duration-300',
        scrolled
          ? 'border-b border-white/10 bg-night/85 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.6)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-b border-transparent bg-night'
      )}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Brand />
        <DesktopNav />
        <div className="flex items-center gap-2">
          <Button asChild variant="spark" size="sm" className="hidden md:inline-flex">
            <Link to="/discovery">Find your solution</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
