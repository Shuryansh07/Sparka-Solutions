import { ArrowRight, Bookmark, HelpCircle, History, Repeat, SkipForward, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHero from '@/shared/components/PageHero';
import PathCards from '../components/PathCards';
import { useDiscoveryStore } from '../store/discovery.store';

const PROMISES = [
  { icon: SkipForward, text: 'Skip any question' },
  { icon: HelpCircle, text: 'Say “I’m not sure”' },
  { icon: Bookmark, text: 'Save and resume later' },
  { icon: Repeat, text: 'Switch paths any time' },
  { icon: UserRound, text: 'Ask for a person at any point' },
];

export default function DiscoveryHubPage() {
  const hasProgress = useDiscoveryStore((s) => s.hasProgress());
  const narrative = useDiscoveryStore((s) => s.narrative);
  const resumePath = narrative.trim() ? '/discovery/describe' : '/discovery/guide';

  return (
    <>
      <PageHero
        kicker="Sparka Discovery"
        title="Let’s start with your needs."
        intro="Choose whichever way feels easiest. Every path reaches the same people and gets the same care."
      />

      <section className="bg-steel py-14 md:py-20">
        <div className="container-page grid gap-8">
          {hasProgress && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-spark/40 bg-[#fdf7e8] px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-spark text-night" aria-hidden="true">
                  <History className="size-5" />
                </span>
                <p>
                  <strong>Welcome back.</strong>{' '}
                  <span className="text-muted-foreground">You have a Discovery in progress on this device.</span>
                </p>
              </div>
              <Button asChild size="sm" className="group">
                <Link to={resumePath}>
                  Continue where you left off
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          )}

          <PathCards />

          <ul aria-label="You stay in control" className="flex flex-wrap justify-center gap-2">
            {PROMISES.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground"
              >
                <Icon className="size-4 text-primary" aria-hidden="true" /> {text}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
