import { AlertCircle, Info, ShieldCheck } from 'lucide-react';

const ICONS = { info: Info, gold: ShieldCheck, error: AlertCircle };

export default function Notice({ tone = 'info', children }) {
  const Icon = ICONS[tone];
  return (
    <div className={`notice${tone !== 'info' ? ` notice--${tone}` : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      <Icon aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
