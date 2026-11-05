import { Bookmark, Check, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUiStore } from '@/shared/store/ui.store';
import { useDiscoveryStore } from '../store/discovery.store';

export default function SaveForLater({ route }) {
  const saveDraft = useDiscoveryStore((s) => s.saveDraft);
  const busy = useDiscoveryStore((s) => s.busy);
  const showToast = useUiStore((s) => s.showToast);
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);

  const onSave = async () => {
    const token = await saveDraft(route);
    if (token) {
      setLink(`${window.location.origin}/discovery/resume/${token}`);
      showToast('Progress saved');
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      showToast('Resume link copied');
    } catch {
      showToast('Select the link to copy it');
    }
  };

  return (
    <div className="grid gap-3">
      <Button type="button" variant="outline" className="w-full" onClick={onSave} disabled={busy}>
        <Bookmark /> Save and finish later
      </Button>
      <AnimatePresence>
        {link && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid gap-2 overflow-hidden"
          >
            <Label htmlFor="resume-link" className="pt-1">
              Your resume link
            </Label>
            <div className="flex gap-2">
              <Input id="resume-link" readOnly value={link} onFocus={(e) => e.target.select()} className="h-10 text-sm" />
              <Button type="button" variant="outline" size="icon" onClick={onCopy} aria-label="Copy resume link">
                {copied ? <Check className="text-primary" /> : <Copy />}
              </Button>
            </div>
            <small className="text-xs text-muted-foreground">
              Keep this link to pick up where you left off on any device.
            </small>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
