import { motion } from 'motion/react';
import { Link, Navigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDiscoveryStore } from '../store/discovery.store';

const NEXT_STEPS = {
  talk: [
    ['We reach out', 'A Sparka representative contacts you to schedule a time that works.'],
    ['We talk', 'We listen to what you’re trying to accomplish. No forms, no pressure.'],
    ['We research options', 'We compare suitable products across manufacturers for your operation.'],
  ],
  default: [
    ['A person reviews it', 'A Sparka representative reviews what you shared.'],
    ['We recap together', 'We call or meet with you to confirm your needs, before any estimate or proposal.'],
    ['We research options', 'We compare suitable products across manufacturers and come back with recommendations.'],
  ],
};

const ease = [0.22, 1, 0.36, 1];

export default function ConfirmationPage() {
  const receipt = useDiscoveryStore((s) => s.receipt);
  if (!receipt) return <Navigate to="/discovery" replace />;

  const steps = NEXT_STEPS[receipt.route] || NEXT_STEPS.default;
  const heard = receipt.heard.filter((l) => !l.startsWith('Route:') && !l.startsWith('Readiness:'));

  return (
    <section className="relative isolate overflow-hidden bg-steel py-14 md:py-24">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-72 bg-night" />
      <div className="container-page max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <Card className="gap-8 p-7 md:p-11">
            <div className="grid justify-items-center gap-4 text-center">
              <div className="relative grid size-16 place-items-center">
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-spark/30"
                  initial={{ scale: 0.6, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ delay: 0.45, duration: 1.1, ease: 'easeOut' }}
                />
                <motion.span
                  className="relative grid size-16 place-items-center rounded-full bg-spark text-night shadow-[0_12px_30px_-10px_var(--spark)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 320, damping: 15 }}
                >
                  <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.5, duration: 0.45, ease: 'easeOut' }}
                    />
                  </svg>
                </motion.span>
              </div>
              <h1 className="type-wide text-[clamp(28px,4vw,40px)] leading-tight font-extrabold">We’ve got it from here.</h1>
              <p className="text-muted-foreground">
                Your reference{' '}
                <strong className="ml-1 rounded-md bg-secondary px-2 py-1 font-mono text-[15px] text-foreground">
                  {receipt.reference}
                </strong>
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-bold">What happens next</h2>
              <ol className="relative grid gap-6 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-border">
                {steps.map(([title, text], i) => (
                  <motion.li
                    key={title}
                    className="relative grid grid-cols-[32px_1fr] gap-4"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.12, duration: 0.5, ease }}
                  >
                    <span className="relative z-10 grid size-8 place-items-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <strong className="font-semibold">{title}</strong>
                      <p className="mt-0.5 text-[15px] text-muted-foreground">{text}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>

            {heard.length > 0 && (
              <Accordion type="single" collapsible className="rounded-xl border px-4">
                <AccordionItem value="heard">
                  <AccordionTrigger>What you shared</AccordionTrigger>
                  <AccordionContent>
                    <ul className="grid gap-2 text-muted-foreground">
                      {heard.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-spark" aria-hidden="true" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/">Back to home</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/solutions">Explore solutions</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
