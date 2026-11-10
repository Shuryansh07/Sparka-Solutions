import { CheckCircle2, RotateCcw, Send, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fieldBase } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MAX_MESSAGE_CHARS, useChatStore } from '../store/chat.store';
import { Bubble, ChatHeader, Typing } from './ChatBubbles';
import ProductCard from './ProductCard';

const GREETING = 'Hi! Ask me about fleet cameras, telematics, upfitting or anything else your vehicles need.';

// Free-text product assistant. Assistant text is rendered as plain text (React escapes it);
// no HTML or markdown is interpreted.
export default function AssistantChat({ onClose, toggle, onUseGuided }) {
  const { messages, status, error, send, stop, reset } = useChatStore();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const streaming = status === 'streaming';
  const last = messages.at(-1);
  const waitingForFirstWord = streaming && last?.role === 'assistant' && !last.content;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, status]);

  useEffect(() => {
    if (!streaming) inputRef.current?.focus();
  }, [streaming]);

  const submit = (text) => {
    if (!text.trim() || streaming) return;
    send(text);
    setDraft('');
  };

  return (
    <>
      <ChatHeader
        subtitle="Ask about products and services"
        toggle={toggle}
        onClose={onClose}
        actions={
          messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-white hover:bg-white/10 hover:text-white"
              onClick={reset}
              title="New conversation"
            >
              <RotateCcw className="size-4" />
              <span className="sr-only">New conversation</span>
            </Button>
          )
        }
      />

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        <Bubble from="bot">{GREETING}</Bubble>

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <Bubble key={i} from="user">
              <p className="whitespace-pre-wrap">{m.content}</p>
            </Bubble>
          ) : (
            (m.content || m.products?.length || m.lead) && (
              <div key={i} className="space-y-2">
                {m.content && (
                  <Bubble from="bot">
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </Bubble>
                )}
                {m.products?.length > 0 && (
                  <div className="grid gap-2 pl-9">
                    {m.products.map((p) => (
                      <ProductCard key={p.sku} product={p} onAsk={submit} disabled={streaming} />
                    ))}
                  </div>
                )}
                {m.lead && (
                  <Bubble from="bot">
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        Request sent. Your reference is <strong className="font-mono">{m.lead}</strong>. A Sparka
                        representative will be in touch.
                      </span>
                    </p>
                  </Bubble>
                )}
              </div>
            )
          )
        )}

        {waitingForFirstWord && <Typing />}

        {status === 'error' && error && (
          <Bubble from="bot">
            <p>{error}</p>
            <Button type="button" size="sm" variant="outline" className="mt-2" onClick={onUseGuided}>
              Use guided questions instead
            </Button>
          </Bubble>
        )}
      </div>

      <form
        className="grid gap-1.5 border-t bg-background px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={MAX_MESSAGE_CHARS}
            placeholder="Ask a question…"
            aria-label="Your question"
            disabled={streaming}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
            className={cn(fieldBase, 'max-h-32 min-h-11 resize-none py-2.5')}
          />
          {streaming ? (
            <Button type="button" size="icon" variant="outline" className="size-11 shrink-0" onClick={stop}>
              <Square />
              <span className="sr-only">Stop</span>
            </Button>
          ) : (
            <Button type="submit" size="icon" className="size-11 shrink-0" disabled={!draft.trim()}>
              <Send />
              <span className="sr-only">Send</span>
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          AI assistant. It never quotes prices; a representative confirms details with you.
        </p>
      </form>
    </>
  );
}
