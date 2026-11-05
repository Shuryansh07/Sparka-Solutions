import { ArrowLeft, Loader2, Send, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import ChipGroup from '@/shared/components/ChipGroup';
import Field from '@/shared/components/Field';
import Notice from '@/shared/components/Notice';
import ContactFields from '../components/ContactFields';
import DiscoveryShell from '../components/DiscoveryShell';
import { FLEET_SIZES, INSTALLATION, TIMINGS, validateContact } from '../lib/flow';
import { useDiscoveryStore } from '../store/discovery.store';

const stage = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

function Select({ label, value, options, onChange }) {
  return (
    <Field as="select" label={label} optional value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Not specified</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </Field>
  );
}

function StepHeading({ title, help }) {
  return (
    <div>
      <h2 className="type-wide text-[clamp(22px,2.6vw,30px)] leading-tight font-bold">{title}</h2>
      {help && <p className="mt-2 text-muted-foreground">{help}</p>}
    </div>
  );
}

export default function DescribePage() {
  const navigate = useNavigate();
  const s = useDiscoveryStore();
  const { narrative, organized, describeStage, library, loadLibrary, busy, error } = s;
  const interestOptions = library?.questions.find((q) => q.id === 'interests')?.options || [];

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const onOrganize = (e) => {
    e.preventDefault();
    s.organizeNarrative();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = validateContact(s.contact);
    if (Object.keys(errors).length) return s.setFieldErrors(errors);
    if (await s.submit('describe')) navigate('/discovery/thanks');
  };

  return (
    <DiscoveryShell
      route="describe"
      title="I’ll Tell You What I Need"
      intro="Describe it in your own words, no questionnaire. We’ll organize your notes for you to confirm."
    >
      <AnimatePresence mode="wait" initial={false}>
        {describeStage === 'write' ? (
          <motion.div key="write" {...stage}>
            <Card asChild className="gap-6 p-6 md:p-9">
              <form onSubmit={onOrganize}>
                <Field
                  as="textarea"
                  label="What are you looking for?"
                  rows={9}
                  maxLength={8000}
                  className="[&_textarea]:min-h-56"
                  placeholder="For example: We run 40 service vans in the Dallas area and want forward-facing cameras and GPS tracking. Our current trackers are old and drivers don't like the app. Hoping to have something in place next quarter, and we'll need installation."
                  hint="Mention anything helpful: vehicles, what you use today, goals, timing, installation, budget."
                  value={narrative}
                  onChange={(e) => s.setNarrative(e.target.value)}
                />
                {error && <Notice tone="error">{error}</Notice>}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[13px] text-muted-foreground tabular-nums">
                    {narrative.length > 0 && `${narrative.length.toLocaleString()} characters`}
                  </span>
                  <Button type="submit" size="lg" disabled={busy || narrative.trim().length < 10}>
                    {busy ? <Loader2 className="animate-spin" /> : <Sparkles />} Organize my notes
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="review" {...stage}>
            <Card asChild className="gap-7 p-6 md:p-9">
              <form onSubmit={onSubmit} noValidate>
                <StepHeading
                  title="Here’s what we heard"
                  help="We organized your notes automatically. Adjust anything that isn’t quite right."
                />

                <blockquote className="relative rounded-xl border-l-[3px] border-spark bg-steel px-5 py-4 text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/80">
                  {narrative}
                </blockquote>

                <div className="grid gap-3">
                  <Label asChild>
                    <span>Areas you mentioned</span>
                  </Label>
                  <ChipGroup
                    label="Areas you mentioned"
                    options={interestOptions}
                    value={organized?.interests || []}
                    onChange={(interests) => s.setOrganized({ interests })}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Select label="Fleet size" value={organized?.fleetSize} options={FLEET_SIZES} onChange={(fleetSize) => s.setOrganized({ fleetSize })} />
                  <Select label="Timing" value={organized?.timing} options={TIMINGS} onChange={(timing) => s.setOrganized({ timing })} />
                  <Select
                    label="Installation"
                    value={organized?.installation}
                    options={INSTALLATION}
                    onChange={(installation) => s.setOrganized({ installation })}
                  />
                </div>

                <Separator />

                <StepHeading
                  title="How can we reach you?"
                  help="A representative will follow up personally to recap your needs."
                />
                <ContactFields />

                {error && <Notice tone="error">{error}</Notice>}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
                  <Button type="button" variant="ghost" onClick={() => s.setDescribeStage('write')}>
                    <ArrowLeft /> Edit my notes
                  </Button>
                  <Button type="submit" variant="spark" size="lg" disabled={busy}>
                    {busy ? <Loader2 className="animate-spin" /> : <Send />} Send to Sparka
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </DiscoveryShell>
  );
}
