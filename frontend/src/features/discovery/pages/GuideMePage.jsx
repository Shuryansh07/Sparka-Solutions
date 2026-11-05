import { ArrowLeft, ArrowRight, Check, HelpCircle, Loader2, Pencil, Plus, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Notice from '@/shared/components/Notice';
import ContactFields from '../components/ContactFields';
import DiscoveryShell from '../components/DiscoveryShell';
import QuestionStep from '../components/QuestionStep';
import { buildGuideSteps, formatAnswer, validateContact } from '../lib/flow';
import { useDiscoveryStore } from '../store/discovery.store';

const stepMotion = {
  enter: (dir) => ({ opacity: 0, x: dir * 36 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir * -36, transition: { duration: 0.2 } }),
};

function StepHeading({ title, help }) {
  return (
    <div>
      <h2 className="type-wide text-[clamp(22px,2.6vw,30px)] leading-tight font-bold">{title}</h2>
      {help && <p className="mt-2 text-muted-foreground">{help}</p>}
    </div>
  );
}

function Review({ steps, onEdit }) {
  const answers = useDiscoveryStore((s) => s.answers);
  const contact = useDiscoveryStore((s) => s.contact);
  const questionSteps = steps.map((s, i) => ({ ...s, index: i })).filter((s) => s.type === 'question');
  const contactIndex = steps.findIndex((s) => s.type === 'contact');

  const rows = [
    ...questionSteps.map(({ question, index }) => ({
      key: question.id,
      label: question.prompt,
      value: formatAnswer(answers[question.id]) || 'Not answered',
      muted: answers[question.id]?.status !== 'answered',
      editLabel: `Edit: ${question.prompt}`,
      index,
    })),
    {
      key: 'contact',
      label: 'How we’ll reach you',
      value: [contact.name, contact.company, contact.email, contact.phone].filter(Boolean).join(', '),
      editLabel: 'Edit contact details',
      index: contactIndex,
    },
  ];

  return (
    <div className="grid gap-6">
      <StepHeading title="Here’s what we heard" help="Check this is right. You can edit anything before sending." />
      <dl className="divide-y rounded-xl border">
        {rows.map((r) => (
          <div key={r.key} className="group grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]">
            <dt className="text-sm text-muted-foreground">{r.label}</dt>
            <dd className={`col-start-1 row-start-2 text-[15px] font-medium sm:col-start-2 sm:row-start-1 ${r.muted ? 'text-muted-foreground italic' : ''}`}>
              {r.value}
            </dd>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="col-start-2 row-span-2 row-start-1 size-8 sm:col-start-3 sm:row-span-1"
              onClick={() => onEdit(r.index)}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{r.editLabel}</span>
            </Button>
          </div>
        ))}
      </dl>
      <Notice tone="gold">
        Next, a Sparka representative will contact you to recap your needs. We never send an estimate or proposal before
        that conversation.
      </Notice>
    </div>
  );
}

function LoadingCard({ children }) {
  return (
    <Card className="flex-row items-center gap-3 p-8 text-muted-foreground" aria-busy="true">
      <Loader2 className="size-5 animate-spin text-primary" /> {children}
    </Card>
  );
}

export default function GuideMePage() {
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const prevIndex = useRef(0);
  const s = useDiscoveryStore();
  const { library, libraryError, loadLibrary, answers, extended, step, busy, error } = s;

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const steps = useMemo(() => (library ? buildGuideSteps(library, answers, extended) : []), [library, answers, extended]);
  const index = Math.min(step, Math.max(steps.length - 1, 0));
  const current = steps[index];
  const direction = index >= prevIndex.current ? 1 : -1;

  useEffect(() => {
    prevIndex.current = index;
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  if (libraryError) {
    return (
      <DiscoveryShell route="guide" title="Guide Me">
        <Card className="gap-4 p-8">
          <Notice tone="error">{libraryError}</Notice>
          <Button type="button" className="w-fit" onClick={loadLibrary}>
            Try again
          </Button>
        </Card>
      </DiscoveryShell>
    );
  }

  if (!library) {
    return (
      <DiscoveryShell route="guide" title="Guide Me">
        <LoadingCard>Loading questions…</LoadingCard>
      </DiscoveryShell>
    );
  }

  const questionCount = steps.filter((x) => x.type === 'question').length;
  const questionNumber = steps.slice(0, index + 1).filter((x) => x.type === 'question').length;
  const progress = ((index + 1) / steps.length) * 100;
  const label =
    current.type === 'question'
      ? `Question ${questionNumber} of ${questionCount}`
      : current.type === 'offer'
        ? 'The essentials are covered'
        : current.type === 'contact'
          ? 'Almost done'
          : 'Final check';

  const go = (to) => {
    s.setStep(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    if (current.type === 'question' && !answers[current.question.id]) s.markAnswer(current.question.id, 'skipped');
    if (current.type === 'contact') {
      const errors = validateContact(s.contact);
      if (Object.keys(errors).length) return s.setFieldErrors(errors);
    }
    go(index + 1);
  };

  const markAndNext = (status) => {
    s.markAnswer(current.question.id, status);
    go(index + 1);
  };

  const onSubmit = async () => {
    if (await s.submit('guide')) navigate('/discovery/thanks');
  };

  const stepKey = current.type === 'question' ? current.question.id : current.type;

  return (
    <DiscoveryShell
      route="guide"
      title="Guide Me"
      intro="A few quick, adaptive questions, usually 3 to 5 and about 2–4 minutes. Skip anything you like."
    >
      <Card className="gap-0 overflow-hidden">
        <div className="grid gap-3 border-b bg-steel/60 px-6 py-4 md:px-9">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground tabular-nums">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} aria-label="Discovery progress" />
        </div>

        <div
          ref={headingRef}
          tabIndex={-1}
          aria-live="polite"
          className="min-h-[300px] overflow-hidden px-6 py-8 outline-none md:px-9 md:py-10"
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div key={stepKey} custom={direction} variants={stepMotion} initial="enter" animate="center" exit="exit">
              {current.type === 'question' && <QuestionStep question={current.question} />}

              {current.type === 'offer' && (
                <div className="grid justify-items-start gap-5">
                  <motion.span
                    aria-hidden="true"
                    className="grid size-14 place-items-center rounded-2xl bg-spark text-night shadow-[0_10px_30px_-10px_var(--spark)]"
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                  >
                    <Check className="size-7" strokeWidth={3} />
                  </motion.span>
                  <StepHeading
                    title="That’s enough for us to start researching."
                    help="Want to add a few optional details, like timing, location, must-haves, constraints or budget? It takes about a minute and helps us come prepared. Totally up to you."
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="outline" size="lg" onClick={() => s.setExtended(true)}>
                      <Plus /> Add a few more details
                    </Button>
                    <Button type="button" size="lg" onClick={() => go(index + 1)} className="group">
                      Continue <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              )}

              {current.type === 'contact' && (
                <div className="grid gap-6">
                  <StepHeading
                    title="How can we reach you?"
                    help="A representative will follow up personally. We don’t share your details."
                  />
                  <ContactFields />
                </div>
              )}

              {current.type === 'review' && <Review steps={steps} onEdit={go} />}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-6">
              <Notice tone="error">{error}</Notice>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 md:px-9">
          <Button
            type="button"
            variant="ghost"
            onClick={() => go(index - 1)}
            className={index === 0 ? 'invisible max-sm:hidden' : ''}
          >
            <ArrowLeft /> Back
          </Button>

          <div className="flex flex-wrap items-center justify-end gap-2 max-sm:w-full">
            {current.type === 'question' && (
              <>
                <Button type="button" variant="ghost" onClick={() => markAndNext('skipped')}>
                  Skip
                </Button>
                <Button type="button" variant="outline" onClick={() => markAndNext('unsure')}>
                  <HelpCircle /> I’m not sure
                </Button>
              </>
            )}
            {(current.type === 'question' || current.type === 'contact') && (
              <Button type="button" onClick={next} className="group">
                {current.type === 'contact' ? 'Review my answers' : 'Continue'}
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
            )}
            {current.type === 'review' && (
              <Button type="button" variant="spark" onClick={onSubmit} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Send />} Send to Sparka
              </Button>
            )}
          </div>
        </div>
      </Card>
    </DiscoveryShell>
  );
}
