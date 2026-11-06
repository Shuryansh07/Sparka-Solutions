import { ArrowUpRight, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
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
  const spring = { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 };

  return (
    <nav aria-label="Primary" className="hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
      <motion.ul
        className="relative flex items-center gap-1 p-1"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
      >
        {NAV_LINKS.map((l) => {
          const Comp = l.to.includes('#') ? Link : NavLink;
          const on = isActive(l.to);
          return (
            <motion.li
              key={l.to}
              className="relative"
              variants={{
                hidden: { opacity: 0, y: -8, filter: 'blur(4px)' },
                show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <AnimatePresence>
                {highlight === l.to && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full border border-white/15 bg-linear-to-b from-white/[0.14] to-white/4 shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_6px_18px_-8px_rgb(0_0_0/0.5)] backdrop-blur-md"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    transition={spring}
                  />
                )}
              </AnimatePresence>
              <Comp
                to={l.to}
                {...(Comp === NavLink ? { end: true } : {})}
                onMouseEnter={() => setHovered(l.to)}
                onFocus={() => setHovered(l.to)}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'group relative z-10 block rounded-full px-4 py-1.5 text-center text-[13.5px] font-medium no-underline transition-colors duration-200',
                  on || hovered === l.to ? 'text-white' : 'text-white/65'
                )}
              >
                <motion.span
                  className="inline-block"
                  animate={{ y: hovered === l.to ? -1 : 0 }}
                  transition={spring}
                >
                  {l.label}
                </motion.span>
                {on && (
                  <motion.span
                    layoutId="nav-active"
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0.5 mx-auto h-[3px] w-5 rounded-full bg-spark shadow-[0_0_10px_var(--spark)]"
                    transition={spring}
                  />
                )}
              </Comp>
            </motion.li>
          );
        })}
      </motion.ul>
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
      <SheetContent className="border-white/10 bg-night/75 px-6 pt-20 text-white shadow-[inset_1px_0_0_rgb(255_255_255/0.08)] backdrop-blur-2xl backdrop-saturate-[1.8]">
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
        'sticky top-0 z-40 isolate text-white backdrop-blur-2xl backdrop-saturate-[1.8] transition-[background-color,box-shadow] duration-500',
        // Inset top highlight + soft drop shadow give the pane its "glass edge".
        scrolled
          ? 'bg-night/65 shadow-[inset_0_1px_0_rgb(255_255_255/0.10),0_12px_40px_-16px_rgb(0_0_0/0.55)]'
          : 'bg-night/90 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]'
      )}
    >
      {/* Frosted sheen: a light wash fading down, plus tinted glows refracting through the pane */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-white/[0.07] via-white/2 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mask-[linear-gradient(to_bottom,black,transparent)]"
      >
        <span className="absolute -top-16 left-[12%] h-32 w-72 rounded-full bg-primary/25 blur-3xl" />
        <span className="absolute -top-20 right-[10%] h-32 w-64 rounded-full bg-spark/10 blur-3xl" />
      </span>
      {/* Hairline bottom edge that catches the light in the middle */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent transition-opacity duration-500',
          scrolled ? 'opacity-100' : 'opacity-60'
        )}
      />
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
