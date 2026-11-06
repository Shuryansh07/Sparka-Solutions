import { ArrowUpRight, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NAV_LINKS } from '../data/site';
import { useUiStore } from '../store/ui.store';

export default function MobileNav() {
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
