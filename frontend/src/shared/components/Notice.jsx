import { AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TONES = {
  info: { icon: Info, variant: 'default' },
  gold: { icon: ShieldCheck, variant: 'spark' },
  error: { icon: AlertCircle, variant: 'destructive' },
};

export default function Notice({ tone = 'info', children, className }) {
  const { icon: Icon, variant } = TONES[tone];
  return (
    <Alert variant={variant} role={tone === 'error' ? 'alert' : 'note'} className={className}>
      <Icon aria-hidden="true" />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
