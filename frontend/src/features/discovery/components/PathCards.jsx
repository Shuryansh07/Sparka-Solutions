import { ArrowRight, Clock, Compass, Headset, PenLine } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { RevealGroup, revealItem } from '@/shared/components/Reveal';
import { ROUTES } from '../lib/flow';

const PATHS = [
  {
    key: 'guide',
    icon: Compass,
    meta: '3–5 questions, about 2–4 minutes',
    text: 'Answer a few quick, adaptive questions. Skip anything or say “I’m not sure.”',
    cta: 'Start guided Discovery',
    featured: true, // the large card; dark by default
  },
  {
    key: 'describe',
    icon: PenLine,
    meta: 'Your words, no questionnaire',
    text: 'Describe what you need in your own words. We’ll organize it for you to confirm.',
    cta: 'Describe your needs',
  },
  {
    key: 'talk',
    icon: Headset,
    meta: 'Phone or video, no forms first',
    text: 'Prefer a conversation? Request a call or video consultation with a Sparka representative.',
    cta: 'Talk to a person',
  },
];

const MotionLink = motion.create(Link);

// A small, decorative glimpse of what a Guide Me question looks like.
const PREVIEW_OPTIONS = ['Cameras & safety', 'GPS & telematics', 'Racks & upfitting', 'Not sure yet'];

function QuestionPreview({ dark }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'mt-7 hidden rounded-xl border p-4 backdrop-blur-sm transition-colors duration-500 lg:block',
        dark ? 'border-white/10 bg-white/[0.04]' : 'border-border bg-steel/60'
      )}
    >
      <div className={cn('mb-3 flex items-center justify-between text-xs', dark ? 'text-white/45' : 'text-muted-foreground')}>
        <span>Question 1 of 4</span>
        <span className={cn('h-1 w-24 overflow-hidden rounded-full', dark ? 'bg-white/10' : 'bg-foreground/10')}>
          <span className="block h-full w-1/4 rounded-full bg-spark" />
        </span>
      </div>
      <p className={cn('font-display text-[15px] font-semibold', dark ? 'text-white' : 'text-foreground')}>
        What would you like help with?
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {PREVIEW_OPTIONS.map((o, i) => (
          <span
            key={o}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors duration-300',
              i === 1
                ? cn('border-spark/60 bg-spark/10', dark ? 'text-white' : 'text-foreground')
                : dark
                  ? 'border-white/10 text-white/60'
                  : 'border-border text-muted-foreground'
            )}
          >
            <span
              className={cn(
                'size-3 rounded-full border',
                i === 1 ? 'border-spark bg-spark' : dark ? 'border-white/30' : 'border-foreground/25'
              )}
            />
            {o}
          </span>
        ))}
      </div>
    </div>
  );
}

function PathCard({ path, dark, onActivate }) {
  const { key, icon: Icon, meta, text, cta, featured } = path;
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const glow = useMotionTemplate`radial-gradient(360px circle at ${x}px ${y}px, ${
    dark ? 'rgb(232 184 74 / 0.16)' : 'rgb(15 124 129 / 0.10)'
  }, transparent 70%)`;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <MotionLink
      to={ROUTES[key].path}
      variants={revealItem}
      onMouseMove={onMove}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onMouseLeave={() => {
        x.set(-400);
        y.set(-400);
      }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'group relative isolate flex flex-col overflow-hidden rounded-2xl border p-7 no-underline outline-none transition-[background-color,color,border-color,box-shadow] duration-500 focus-visible:ring-[3px] focus-visible:ring-ring/50 md:p-8',
        featured && 'lg:row-span-2',
        dark
          ? 'border-white/10 bg-night text-white shadow-[0_24px_60px_-28px_rgb(7_27_32/0.8)]'
          : 'bg-background text-foreground shadow-[0_1px_2px_rgb(7_27_32/0.04)]'
      )}
    >
      <motion.span aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: glow }} />
      <span
        aria-hidden="true"
        className={cn('bg-grid-night absolute inset-0 -z-20 transition-opacity duration-500', dark ? 'opacity-60' : 'opacity-0')}
      />

      <span
        aria-hidden="true"
        className={cn(
          'grid size-12 place-items-center rounded-xl transition-[transform,background-color,color] duration-300 group-hover:-rotate-6',
          dark ? 'bg-spark text-night' : 'bg-accent text-primary'
        )}
      >
        <Icon className="size-[22px]" />
      </span>

      <span
        className={cn(
          'mt-6 flex items-center gap-1.5 text-[13px] transition-colors duration-500',
          dark ? 'text-white/55' : 'text-muted-foreground'
        )}
      >
        <Clock className="size-3.5" aria-hidden="true" />
        {meta}
      </span>
      <h3 className={cn('mt-2 font-bold', featured ? 'type-wide text-3xl md:text-4xl' : 'text-2xl')}>
        {ROUTES[key].label}
      </h3>
      <p
        className={cn(
          'mt-3 text-[17px] leading-relaxed font-medium transition-colors duration-500 md:text-lg',
          featured && 'max-w-sm',
          dark ? 'text-white/75' : 'text-muted-foreground'
        )}
      >
        {text}
      </p>

      {featured && <QuestionPreview dark={dark} />}

      <span
        className={cn(
          'mt-auto flex items-center gap-2 pt-8 text-[15px] font-semibold transition-colors duration-500',
          dark ? 'text-spark' : 'text-primary'
        )}
      >
        {cta}
        <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
      </span>
    </MotionLink>
  );
}

// Exactly one card is dark: Guide Me by default, or whichever card is hovered/focused.
const DEFAULT_ACTIVE = PATHS.find((p) => p.featured).key;

export default function PathCards() {
  const [active, setActive] = useState(DEFAULT_ACTIVE);
  return (
    <RevealGroup
      className="grid gap-4 md:gap-5 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-2"
      onMouseLeave={() => setActive(DEFAULT_ACTIVE)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setActive(DEFAULT_ACTIVE);
      }}
    >
      {PATHS.map((p) => (
        <PathCard key={p.key} path={p} dark={active === p.key} onActivate={() => setActive(p.key)} />
      ))}
    </RevealGroup>
  );
}
