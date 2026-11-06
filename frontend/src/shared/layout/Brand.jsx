import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Brand({ className }) {
  return (
    <Link
      to="/"
      aria-label="Sparka Solutions home"
      className={cn('group inline-flex items-center gap-2.5 text-white no-underline', className)}
    >
      <span className="relative size-9 overflow-hidden rounded-full ring-1 ring-white/15 transition-shadow duration-300 group-hover:shadow-[0_0_24px_-2px_var(--spark)]">
        <img src="/images/logo-mark-128.webp" alt="" width="36" height="36" className="size-full object-cover" />
      </span>
      <span className="grid leading-none">
        <strong className="type-wide text-[19px] font-extrabold tracking-[0.06em]">SPARKA</strong>
        <small className="mt-1 text-[9px] font-medium tracking-[0.42em] text-spark">SOLUTIONS</small>
      </span>
    </Link>
  );
}
