import { Bot, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Bubble({ from, children }) {
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

export function Typing() {
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

// Panel header shared by both chat modes. `actions` are extra icon buttons (e.g. Start over);
// `toggle` is the mode switch, shown only when the free-text assistant is available.
export function ChatHeader({ subtitle, actions, toggle, onClose }) {
  return (
    <header className="bg-night px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-spark text-night">
          <Bot className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">Sparka Assistant</p>
          <p className="text-xs text-white/70">{subtitle}</p>
        </div>
        {actions}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-white hover:bg-white/10 hover:text-white"
          onClick={onClose}
        >
          <X className="size-4" />
          <span className="sr-only">Close assistant</span>
        </Button>
      </div>
      {toggle && <div className="mt-3">{toggle}</div>}
    </header>
  );
}
