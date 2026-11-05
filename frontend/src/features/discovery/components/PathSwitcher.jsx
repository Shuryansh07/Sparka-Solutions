import { motion } from 'motion/react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ROUTES } from '../lib/flow';

export default function PathSwitcher() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Choose how to start"
      className="mt-8 inline-flex w-full max-w-full rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur sm:w-auto"
    >
      {Object.entries(ROUTES).map(([key, r]) => {
        const active = pathname === r.path;
        return (
          <NavLink
            key={key}
            to={r.path}
            className={cn(
              'relative flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium no-underline transition-colors sm:flex-none sm:px-5',
              active ? 'text-night' : 'text-white/65 hover:text-white'
            )}
          >
            {active && (
              <motion.span
                layoutId="path-switcher-pill"
                className="absolute inset-0 rounded-lg bg-spark shadow-[0_6px_20px_-8px_var(--spark)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 hidden sm:inline">{r.label}</span>
            <span className="relative z-10 sm:hidden">{r.short}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
