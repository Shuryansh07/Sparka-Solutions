import { Bot, Loader2, MessageCircle, RotateCcw, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fieldBase } from '@/components/ui/input';
import ChipGroup from '@/shared/components/ChipGroup';
import { cn } from '@/lib/utils';
import { buildGuideSteps, formatAnswer, validateContact } from '../lib/flow';
import { useDiscoveryStore } from '../store/discovery.store';

// Routes where the floating assistant would duplicate what's already on screen.
const HIDDEN_ON = ['/discovery/guide', '/discovery/thanks'];

const GREETING =
  'Hi! I’m the Sparka assistant. I’ll ask a few quick questions (about 2–4 minutes) so our team can come prepared. Skip anything you like.';

// The Guide Me steps, with "contact" split into one chat turn per field.
function toChatSteps(steps) {
  return steps.flatMap((s) => {
    if (s.type === 'question') return [{ kind: 'question', id: s.question.id, question: s.question }];
    if (s.type === 'offer') return [{ kind: 'offer', id: 'offer' }];
    if (s.type === 'contact')
      return [
        { kind: 'name', id: 'name' },
        { kind: 'reach', id: 'reach' },
        { kind: 'company', id: 'company' },
      ];
    return [{ kind: 'review', id: 'review' }];
  });
}

function botText(step) {
  switch (step.kind) {
    case 'question':
      return { text: step.question.prompt, help: step.question.help };
    case 'offer':
      return {
        text: 'That’s enough for us to start researching.',
        help: 'Want to add a few optional details, like timing, location, must-haves or budget? It takes about a minute.',
      };
    case 'name':
      return { text: 'Great. What’s your name?', help: 'A representative will follow up personally.' };
    case 'reach':
      return { text: 'What’s the best email or phone number to reach you?' };
    case 'company':
      return { text: 'And your company name?', help: 'Optional.' };
    default:
      return {
        text: 'Here’s what I heard. Look right?',
        help: 'A Sparka representative will contact you to recap. We never send an estimate before that conversation.',
      };
  }
}

function userText(step, { answers, contact, offerDeclined }) {
  switch (step.kind) {
    case 'question':
      return formatAnswer(answers[step.id]) || 'Skipped';
    case 'offer':
      return offerDeclined ? 'No thanks, let’s continue' : 'Add a few more details';
    case 'name':
      return contact.name;
    case 'reach':
      return contact.email || contact.phone;
    case 'company':
      return contact.company || 'Skipped';
    default:
      return '';
  }
}

function isDone(step, answers, contact) {
  if (step.kind === 'question') return !!answers[step.id];
  if (step.kind === 'name') return !!contact.name?.trim();
  if (step.kind === 'reach') return !!(contact.email?.trim() || contact.phone?.trim());
  return false;
}

function Bubble({ from, children }) {
  const bot = from === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex gap-2', bot ? 'justify-start' : 'justify-end')}
    >
      {bot && (
        <span aria-hidden="true" className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary text-white">
          <Bot className="size-4" />
        </span>
      )}
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed',
          bot ? 'rounded-tl-sm bg-steel text-foreground' : 'rounded-tr-sm bg-primary text-primary-foreground'
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

function BotMessage({ step }) {
  const { text, help } = botText(step);
  return (
    <Bubble from="bot">
      <p className="font-medium">{text}</p>
      {help && <p className="mt-1 text-[13px] text-muted-foreground">{help}</p>}
    </Bubble>
  );
}

function Typing() {
  return (
    <Bubble from="bot">
      <span className="flex gap-1 py-1" aria-label="Assistant is typing">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-muted-foreground/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
    </Bubble>
  );
}

function TextComposer({ placeholder, multiline, initial = '', onSend, error, required = true, inputType = 'text' }) {
  const [value, setValue] = useState(initial);
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);
  const send = (e) => {
    e?.preventDefault();
    if (required && !value.trim()) return;
    onSend(value.trim());
  };
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <form onSubmit={send} className="grid gap-1.5">
      <div className="flex items-end gap-2">
        <Tag
          ref={ref}
          type={multiline ? undefined : inputType}
          rows={multiline ? 2 : undefined}
          value={value}
          maxLength={4000}
          placeholder={placeholder || 'Type your answer…'}
          aria-invalid={!!error}
          aria-label="Your answer"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (multiline && e.key === 'Enter' && !e.shiftKey) send(e);
          }}
          className={cn(fieldBase, multiline ? 'max-h-32 min-h-11 resize-none py-2.5' : 'h-11')}
        />
        <Button type="submit" size="icon" className="size-11 shrink-0" disabled={required && !value.trim()}>
          <Send />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      {error && <p className="text-[13px] text-destructive">{error}</p>}
    </form>
  );
}

function QuestionComposer({ question, onAnswer, onMark }) {
  const answer = useDiscoveryStore((s) => s.answers[question.id]);
  const initial = answer?.status === 'answered' ? answer.value : question.type === 'multi' ? [] : '';
  const [multi, setMulti] = useState(Array.isArray(initial) ? initial : []);

  return (
    <div className="grid gap-3">
      {question.type === 'single' && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={question.prompt}>
          {question.options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onAnswer(o)}
              className="rounded-full border bg-background px-3.5 py-2 text-sm font-medium outline-none transition-colors hover:border-primary/40 hover:bg-steel focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {o}
            </button>
          ))}
        </div>
      )}
      {question.type === 'multi' && (
        <>
          <ChipGroup label={question.prompt} options={question.options} value={multi} onChange={setMulti} />
          <Button type="button" className="w-fit" disabled={!multi.length} onClick={() => onAnswer(multi)}>
            <Send /> Send{multi.length ? ` (${multi.length})` : ''}
          </Button>
        </>
      )}
      {(question.type === 'text' || question.type === 'textarea') && (
        <TextComposer
          multiline={question.type === 'textarea'}
          placeholder={question.placeholder}
          initial={typeof initial === 'string' ? initial : ''}
          onSend={onAnswer}
        />
      )}
      <div className="flex gap-1">
        <Button type="button" variant="ghost" size="sm" onClick={() => onMark('skipped')}>
          Skip
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onMark('unsure')}>
          I’m not sure
        </Button>
      </div>
    </div>
  );
}

function ReviewSummary({ chatSteps, data }) {
  const rows = chatSteps.filter((s) => s.kind === 'question' && data.answers[s.id]?.status === 'answered');
  const { contact } = data;
  return (
    <Bubble from="bot">
      <dl className="grid gap-2">
        {rows.map((s) => (
          <div key={s.id}>
            <dt className="text-[12px] text-muted-foreground">{s.question.prompt}</dt>
            <dd className="font-medium">{formatAnswer(data.answers[s.id])}</dd>
          </div>
        ))}
        <div>
          <dt className="text-[12px] text-muted-foreground">How we’ll reach you</dt>
          <dd className="font-medium">
            {[contact.name, contact.company, contact.email, contact.phone].filter(Boolean).join(', ')}
          </dd>
        </div>
      </dl>
    </Bubble>
  );
}

export default function ChatbotWidget() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [typing, setTyping] = useState(false);
  const [offerDeclined, setOfferDeclined] = useState(false);
  const [reachError, setReachError] = useState(null);
  const scrollRef = useRef(null);
  const launcherRef = useRef(null);

  const s = useDiscoveryStore();
  const { library, libraryError, loadLibrary, answers, extended, contact, busy, error } = s;

  useEffect(() => {
    if (open) loadLibrary();
  }, [open, loadLibrary]);

  const chatSteps = useMemo(
    () => (library ? toChatSteps(buildGuideSteps(library, answers, extended)) : []),
    [library, answers, extended]
  );

  // Resume where an earlier session (chat or Guide Me page) left off.
  useEffect(() => {
    if (pos !== null || !chatSteps.length) return;
    const first = chatSteps.findIndex((st) => !isDone(st, answers, contact));
    setPos(first === -1 ? chatSteps.length - 1 : first);
  }, [chatSteps, pos, answers, contact]);

  const index = pos === null ? 0 : Math.min(pos, chatSteps.length - 1);
  const current = chatSteps[index];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [index, typing, open, error, reachError]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (HIDDEN_ON.includes(pathname)) return null;

  const advance = (to = index + 1) => {
    setTyping(true);
    setPos(to);
    setTimeout(() => setTyping(false), 450);
  };

  const answerQuestion = (value) => {
    s.setAnswer(current.id, value);
    advance();
  };

  const markQuestion = (status) => {
    s.markAnswer(current.id, status);
    advance();
  };

  const sendReach = (value) => {
    const isEmail = value.includes('@');
    const patch = isEmail ? { email: value, phone: '' } : { phone: value, email: '' };
    const errs = validateContact({ name: contact.name || 'x', ...patch });
    const msg = errs.email || errs.phone;
    if (msg) return setReachError(isEmail ? msg : errs.phone || 'Enter a valid email address or phone number.');
    setReachError(null);
    s.setContact(patch);
    advance();
  };

  const restart = () => {
    s.reset();
    setOfferDeclined(false);
    setReachError(null);
    setPos(0);
  };

  const onSubmit = async () => {
    if (await s.submit('guide')) {
      setOpen(false);
      setPos(null);
      setOfferDeclined(false);
      navigate('/discovery/thanks');
    }
  };

  const data = { answers, contact, offerDeclined };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="Sparka assistant"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-4 bottom-24 z-50 flex h-[min(620px,calc(100dvh-8rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
          >
            <header className="flex items-center gap-3 bg-night px-4 py-3 text-white">
              <span className="grid size-9 place-items-center rounded-full bg-spark text-night">
                <Bot className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">Sparka Assistant</p>
                <p className="text-xs text-white/70">Guide Me, as a chat</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-white hover:bg-white/10 hover:text-white"
                onClick={restart}
                title="Start over"
              >
                <RotateCcw className="size-4" />
                <span className="sr-only">Start over</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setOpen(false);
                  launcherRef.current?.focus();
                }}
              >
                <X className="size-4" />
                <span className="sr-only">Close assistant</span>
              </Button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              <Bubble from="bot">{GREETING}</Bubble>

              {libraryError && (
                <Bubble from="bot">
                  <p>Sorry, I couldn’t load the questions. {libraryError}</p>
                  <Button type="button" size="sm" className="mt-2" onClick={loadLibrary}>
                    Try again
                  </Button>
                </Bubble>
              )}
              {!library && !libraryError && <Typing />}

              {library &&
                chatSteps.slice(0, index).map((st) => (
                  <div key={st.id} className="space-y-3">
                    <BotMessage step={st} />
                    <Bubble from="user">{userText(st, data)}</Bubble>
                  </div>
                ))}

              {library && current && (typing ? <Typing /> : <BotMessage step={current} />)}
              {library && current?.kind === 'review' && !typing && <ReviewSummary chatSteps={chatSteps} data={data} />}
              {error && <Bubble from="bot">{error}</Bubble>}
            </div>

            {library && current && !typing && (
              <div className="border-t bg-background px-4 py-3">
                {current.kind === 'question' && (
                  <QuestionComposer
                    key={current.id}
                    question={current.question}
                    onAnswer={answerQuestion}
                    onMark={markQuestion}
                  />
                )}
                {current.kind === 'offer' && (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                        // Extended questions take the offer's place, so stay on this index.
                        s.setExtended(true);
                        advance(index);
                      }}>
                      Add a few more details
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setOfferDeclined(true);
                        advance();
                      }}
                    >
                      No thanks, continue
                    </Button>
                  </div>
                )}
                {current.kind === 'name' && (
                  <TextComposer
                    key="name"
                    placeholder="Your name"
                    initial={contact.name}
                    onSend={(v) => {
                      s.setContact({ name: v });
                      advance();
                    }}
                  />
                )}
                {current.kind === 'reach' && (
                  <TextComposer
                    key="reach"
                    placeholder="you@company.com or phone"
                    initial={contact.email || contact.phone}
                    error={reachError}
                    onSend={sendReach}
                  />
                )}
                {current.kind === 'company' && (
                  <div className="grid gap-1">
                    <TextComposer
                      key="company"
                      placeholder="Company"
                      initial={contact.company}
                      onSend={(v) => {
                        s.setContact({ company: v });
                        advance();
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-fit"
                      onClick={() => {
                        s.setContact({ company: '' });
                        advance();
                      }}
                    >
                      Skip
                    </Button>
                  </div>
                )}
                {current.kind === 'review' && (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="spark" onClick={onSubmit} disabled={busy}>
                      {busy ? <Loader2 className="animate-spin" /> : <Send />} Send to Sparka
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOpen(false);
                        navigate('/discovery/guide');
                      }}
                    >
                      Edit answers
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        ref={launcherRef}
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Close Sparka assistant' : 'Open Sparka assistant'}
        onClick={() => setOpen((o) => !o)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="fixed right-4 bottom-4 z-50 grid size-16 place-items-center rounded-full bg-primary text-white shadow-[0_12px_30px_-8px_var(--primary)] outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'x' : 'chat'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X className="size-7" /> : <MessageCircle className="size-7" />}
          </motion.span>
        </AnimatePresence>
        {!open && (
          <span aria-hidden="true" className="absolute top-0.5 right-0.5 size-3.5 rounded-full border-2 border-background bg-spark" />
        )}
      </motion.button>
    </>
  );
}
