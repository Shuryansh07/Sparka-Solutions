import { MessageCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AssistantChat from '@/features/chat/components/AssistantChat';
import { getChatStatus } from '@/features/chat/api/chat.api';
import { cn } from '@/lib/utils';
import GuidedChat from './GuidedChat';

// Routes where the floating assistant would duplicate what's already on screen.
const HIDDEN_ON = ['/discovery/guide', '/discovery/thanks'];

function ModeToggle({ mode, onChange }) {
  const options = [
    ['ask', 'Ask a question'],
    ['guided', 'Guided questions'],
  ];
  return (
    <div role="tablist" aria-label="Chat mode" className="grid grid-cols-2 gap-1 rounded-lg bg-white/10 p-1 text-[13px]">
      {options.map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={mode === value}
          onClick={() => onChange(value)}
          className={cn(
            'rounded-md px-2 py-1.5 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-spark',
            mode === value ? 'bg-spark text-night' : 'text-white/75 hover:text-white'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Floating launcher + chat panel. The panel shows the free-text assistant ("Ask") when the API
// reports it enabled, and the scripted Guide Me chat otherwise (or when the visitor switches).
export default function ChatbotWidget() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [assistantEnabled, setAssistantEnabled] = useState(null); // null = not checked yet
  const [mode, setMode] = useState('ask');
  const launcherRef = useRef(null);

  // Ask the API once, on first open, whether the assistant is configured.
  useEffect(() => {
    if (!open || assistantEnabled !== null) return;
    let live = true;
    getChatStatus().then(({ enabled }) => live && setAssistantEnabled(enabled));
    return () => {
      live = false;
    };
  }, [open, assistantEnabled]);

  // One-time "How may I help you?" nudge on first load, shown for 3 seconds.
  const [nudge, setNudge] = useState(false);
  useEffect(() => {
    const show = setTimeout(() => setNudge(true), 600);
    const hide = setTimeout(() => setNudge(false), 3600);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (HIDDEN_ON.includes(pathname)) return null;

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };
  const showAssistant = assistantEnabled === true && mode === 'ask';
  const toggle = assistantEnabled ? <ModeToggle mode={mode} onChange={setMode} /> : null;

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
            {assistantEnabled === null ? (
              <div className="grid flex-1 place-items-center text-sm text-muted-foreground" aria-busy="true">
                Connecting…
              </div>
            ) : showAssistant ? (
              <AssistantChat onClose={close} toggle={toggle} onUseGuided={() => setMode('guided')} />
            ) : (
              <GuidedChat onClose={close} toggle={toggle} />
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {nudge && !open && (
          <motion.button
            type="button"
            onClick={() => {
              setNudge(false);
              setOpen(true);
            }}
            initial={{ opacity: 0, x: 12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="fixed right-24 bottom-7 z-50 rounded-2xl rounded-br-sm border bg-background px-4 py-2.5 text-sm font-medium whitespace-nowrap text-foreground shadow-lg"
          >
            How may I help you?
          </motion.button>
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
