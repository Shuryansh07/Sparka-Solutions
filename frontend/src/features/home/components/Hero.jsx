import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ease = [0.22, 1, 0.36, 1];
const PROMISES = ['Complete product sourcing', 'Industry expertise', 'One trusted partner'];

function Line({ children, delay }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="text-chrome block"
        initial={{ y: '105%' }}
        animate={{ y: 0 }}
        transition={{ delay, duration: 0.9, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// The gold streak that "strikes" between the two lines, echoing the bolt in the logo.
function SparkStreak() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 40"
      preserveAspectRatio="none"
      className="pointer-events-none my-1 h-5 w-full max-w-[min(100%,880px)] overflow-visible md:h-7"
    >
      <defs>
        <linearGradient id="spark-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#e8b84a" stopOpacity="0" />
          <stop offset="0.35" stopColor="#e8b84a" />
          <stop offset="0.8" stopColor="#f3d58e" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <filter id="spark-glow" x="-10%" y="-200%" width="120%" height="500%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d="M0 22 L520 22 L560 6 L585 34 L612 14 L1000 18"
        fill="none"
        stroke="url(#spark-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#spark-glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}

export default function Hero() {
  const figureRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: figureRef, offset: ['start end', 'end start'] });
  // Gentle parallax: the photo drifts slower than the page as you scroll past it.
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden="true" className="bg-grid-night absolute inset-0 -z-10" />
      <motion.div
        aria-hidden="true"
        className="absolute top-[18%] left-1/2 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-spark/15 blur-[140px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.55] }}
        transition={{ delay: 0.7, duration: 1.6, times: [0, 0.3, 1] }}
      />
      <div aria-hidden="true" className="absolute -top-48 -left-40 -z-10 size-[560px] rounded-full bg-primary/25 blur-[130px]" />

      <div className="container-page pt-14 md:pt-24">
        <h1 className="type-wide text-[clamp(38px,6.4vw,88px)] leading-[0.96] font-extrabold">
          <Line delay={0.15}>The right technology.</Line>
          <SparkStreak />
          <Line delay={0.35}>The right solution.</Line>
        </h1>

        <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <motion.p
            className="max-w-xl text-[clamp(16px,1.5vw,18px)] leading-relaxed text-white/70"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease }}
          >
            From essential supplies and outfitting to advanced electronics and specialized equipment, we find the right
            products across manufacturers, backed by knowledgeable people and coordinated support.
          </motion.p>

          <motion.div
            className="grid gap-3 sm:flex sm:flex-wrap"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease }}
          >
            {/* Full-width, equal buttons when stacked on phones; natural width side by side above. */}
            <Button asChild variant="spark" size="lg" className="group w-full sm:w-auto">
              <Link to="/discovery">
                Find your solution
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg" className="w-full sm:w-auto">
              <Link to="/#how">See how it works</Link>
            </Button>
          </motion.div>
        </div>

        <motion.ul
          className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
          {PROMISES.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-spark" aria-hidden="true" />
              {p}
            </li>
          ))}
        </motion.ul>

        <motion.figure
          ref={figureRef}
          className="relative mt-12 mb-0 aspect-[4/3] overflow-hidden rounded-t-3xl border border-b-0 border-white/10 sm:aspect-[21/9] md:mt-16"
          initial={{ clipPath: 'inset(0 100% 0 0 round 24px 24px 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0 round 24px 24px 0 0)' }}
          transition={{ delay: 0.5, duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        >
          <motion.img
            src="/images/hero-highway-1600.webp"
            srcSet="/images/hero-highway-960.webp 960w, /images/hero-highway-1600.webp 1600w"
            sizes="(min-width: 1280px) 1200px, 100vw"
            alt="A semi truck with its headlights on, driving toward the camera on an open highway at dusk"
            width="1600"
            height="1066"
            decoding="async"
            fetchPriority="high"
            style={{ y: imgY }}
            className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover object-[60%_55%]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night via-night/10 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-glint absolute inset-y-0 -left-1/3 w-1/4 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          </div>
          <figcaption className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-xl border border-white/15 bg-night/60 px-4 py-3 text-sm backdrop-blur-md md:bottom-8 md:left-8 md:px-5 md:py-4">
            <span className="block font-display text-base font-semibold text-white md:text-lg">
              We start with what you need, not with what we sell.
            </span>
            <span className="text-white/60">Every fleet, every size, every need.</span>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
