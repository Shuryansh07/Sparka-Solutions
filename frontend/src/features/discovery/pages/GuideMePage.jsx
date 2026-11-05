import { ArrowLeft, ArrowRight, Check, HelpCircle, Pencil, Plus, Send } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Notice from '../../../shared/components/Notice';
import ContactFields from '../components/ContactFields';
import DiscoveryShell from '../components/DiscoveryShell';
import QuestionStep from '../components/QuestionStep';
import { buildGuideSteps, formatAnswer, validateContact } from '../lib/flow';
import { useDiscoveryStore } from '../store/discovery.store';

function Progress({ value, label }) {
  return (
    <div className="wizard-progress">
      <div className="wizard-progress__label">{label}</div>
      <div
        className="wizard-progress__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
      >
        <div style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Review({ steps, onEdit }) {
  const answers = useDiscoveryStore((s) => s.answers);
  const contact = useDiscoveryStore((s) => s.contact);
  const questionSteps = steps.map((s, i) => ({ ...s, index: i })).filter((s) => s.type === 'question');
  const contactIndex = steps.findIndex((s) => s.type === 'contact');

  return (
    <div className="review">
      <h2 className="question__prompt">Here’s what we heard</h2>
      <p className="question__help">Please check this is right. You can edit anything before sending.</p>
      <dl className="heard">
        {questionSteps.map(({ question, index }) => (
          <div key={question.id} className="heard__row">
            <dt>{question.prompt}</dt>
            <dd className={answers[question.id]?.status === 'answered' ? '' : 'heard__muted'}>
              {formatAnswer(answers[question.id]) || 'Not answered'}
            </dd>
            <button type="button" className="heard__edit" onClick={() => onEdit(index)}>
              <Pencil aria-hidden="true" />
              <span className="sr-only">Edit: {question.prompt}</span>
            </button>
          </div>
        ))}
        <div className="heard__row">
          <dt>How we’ll reach you</dt>
          <dd>{[contact.name, contact.company, contact.email, contact.phone].filter(Boolean).join(' • ')}</dd>
          <button type="button" className="heard__edit" onClick={() => onEdit(contactIndex)}>
            <Pencil aria-hidden="true" />
            <span className="sr-only">Edit contact details</span>
          </button>
        </div>
      </dl>
      <Notice tone="gold">
        Next, a Sparka representative will contact you to recap your needs. We never send an estimate or proposal
        before that conversation.
      </Notice>
    </div>
  );
}

export default function GuideMePage() {
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const s = useDiscoveryStore();
  const { library, libraryError, loadLibrary, answers, extended, step, busy, error } = s;

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const steps = useMemo(() => (library ? buildGuideSteps(library, answers, extended) : []), [library, answers, extended]);
  const index = Math.min(step, Math.max(steps.length - 1, 0));
  const current = steps[index];

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  if (libraryError) {
    return (
      <DiscoveryShell route="guide" title="Guide Me">
        <div className="panel">
          <Notice tone="error">{libraryError}</Notice>
          <button type="button" className="btn btn--primary" onClick={loadLibrary}>
            Try again
          </button>
        </div>
      </DiscoveryShell>
    );
  }

  if (!library) {
    return (
      <DiscoveryShell route="guide" title="Guide Me">
        <div className="panel panel--loading" aria-busy="true">
          <span className="spinner" /> Loading questions...
        </div>
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
        ? 'Nice work - the essentials are covered'
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

  return (
    <DiscoveryShell
      route="guide"
      title="Guide Me"
      intro="A few quick, adaptive questions - usually 3 to 5, about 2-4 minutes. Skip anything you like."
    >
      <div className="panel wizard">
        <Progress value={progress} label={label} />

        <div className="wizard__body" ref={headingRef} tabIndex={-1} aria-live="polite">
          {current.type === 'question' && <QuestionStep key={current.question.id} question={current.question} />}

          {current.type === 'offer' && (
            <div className="offer">
              <span className="offer__icon" aria-hidden="true">
                <Check />
              </span>
              <h2 className="question__prompt">That’s enough for us to start researching.</h2>
              <p className="question__help">
                Want to add a few optional details - timing, location, must-haves, constraints, budget? It takes about
                a minute and helps us come prepared. Totally up to you.
              </p>
              <div className="offer__actions">
                <button type="button" className="btn btn--ghost" onClick={() => s.setExtended(true)}>
                  <Plus /> Add a few more details
                </button>
                <button type="button" className="btn btn--primary" onClick={() => go(index + 1)}>
                  Continue <ArrowRight />
                </button>
              </div>
            </div>
          )}

          {current.type === 'contact' && (
            <div>
              <h2 className="question__prompt">How can we reach you?</h2>
              <p className="question__help">A representative will follow up personally. We don’t share your details.</p>
              <ContactFields />
            </div>
          )}

          {current.type === 'review' && <Review steps={steps} onEdit={go} />}
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        <div className="wizard__footer">
          <button
            type="button"
            className="btn btn--text"
            onClick={() => go(index - 1)}
            style={{ visibility: index === 0 ? 'hidden' : 'visible' }}
          >
            <ArrowLeft /> Back
          </button>

          <div className="wizard__footer-right">
            {current.type === 'question' && (
              <>
                <button type="button" className="btn btn--text" onClick={() => markAndNext('skipped')}>
                  Skip
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => markAndNext('unsure')}>
                  <HelpCircle /> I’m not sure
                </button>
              </>
            )}
            {(current.type === 'question' || current.type === 'contact') && (
              <button type="button" className="btn btn--primary" onClick={next}>
                {current.type === 'contact' ? 'Review my answers' : 'Continue'} <ArrowRight />
              </button>
            )}
            {current.type === 'review' && (
              <button type="button" className="btn btn--primary" onClick={onSubmit} disabled={busy}>
                {busy ? <span className="spinner" aria-hidden="true" /> : <Send />} Send to Sparka
              </button>
            )}
          </div>
        </div>
      </div>
    </DiscoveryShell>
  );
}
