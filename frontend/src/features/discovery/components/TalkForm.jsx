import { Loader2, Mail, Phone, Send, Video } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Field from '@/shared/components/Field';
import Notice from '@/shared/components/Notice';
import { validateContact } from '../lib/flow';
import { useDiscoveryStore } from '../store/discovery.store';
import ContactFields from './ContactFields';

const METHODS = [
  { value: 'phone', label: 'Phone call', icon: Phone },
  { value: 'video', label: 'Video call', icon: Video },
  { value: 'email', label: 'Email me first', icon: Mail },
];

export default function TalkForm() {
  const navigate = useNavigate();
  const talk = useDiscoveryStore((s) => s.talk);
  const setTalk = useDiscoveryStore((s) => s.setTalk);
  const contact = useDiscoveryStore((s) => s.contact);
  const setFieldErrors = useDiscoveryStore((s) => s.setFieldErrors);
  const submit = useDiscoveryStore((s) => s.submit);
  const busy = useDiscoveryStore((s) => s.busy);
  const error = useDiscoveryStore((s) => s.error);

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = validateContact(contact);
    if (Object.keys(errors).length) return setFieldErrors(errors);
    if (await submit('talk')) navigate('/discovery/thanks');
  };

  return (
    <Card asChild className="gap-7 p-6 md:p-9">
      <form onSubmit={onSubmit} noValidate>
        <fieldset className="grid gap-3">
          <legend className="mb-3 text-sm font-medium">How would you like to talk?</legend>
          <div className="grid grid-cols-3 gap-2.5">
            {METHODS.map(({ value, label, icon: Icon }) => {
              const on = talk.method === value;
              return (
                <label
                  key={value}
                  className={cn(
                    'relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-2 py-4 text-center text-sm font-medium transition-colors duration-200 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40',
                    on ? 'border-primary text-primary' : 'hover:border-primary/40 hover:bg-steel'
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="talk-method"
                      className="absolute inset-0 rounded-xl bg-accent/70 shadow-[inset_0_0_0_1px_var(--primary)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <input
                    type="radio"
                    name="method"
                    value={value}
                    checked={on}
                    onChange={() => setTalk({ method: value })}
                    className="sr-only"
                  />
                  <Icon className="relative size-5" aria-hidden="true" />
                  <span className="relative">{label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <ContactFields showLocation={false} showBestTime />

        <Field
          as="textarea"
          label="Anything you’d like us to know before we talk?"
          optional
          placeholder="Totally optional. We’re happy to start from scratch on the call."
          value={talk.topic}
          maxLength={2000}
          onChange={(e) => setTalk({ topic: e.target.value })}
        />

        {error && <Notice tone="error">{error}</Notice>}

        <div className="grid gap-3">
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Send />}
            Request a conversation
          </Button>
          <p className="text-center text-[13px] text-muted-foreground">
            A Sparka representative will reach out to schedule. No sales pressure, no obligation.
          </p>
        </div>
      </form>
    </Card>
  );
}
