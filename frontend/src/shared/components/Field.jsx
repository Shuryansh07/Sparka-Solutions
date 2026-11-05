import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const CONTROLS = { input: Input, textarea: Textarea, select: NativeSelect };

export default function Field({ label, optional, hint, error, as = 'input', className, children, ...props }) {
  const id = useId();
  const Control = CONTROLS[as] || Input;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('grid content-start gap-2', className)}>
      <Label htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-muted-foreground">Optional</span>}
      </Label>
      <Control id={id} aria-invalid={!!error || undefined} aria-describedby={describedBy} {...props}>
        {children}
      </Control>
      {hint && !error && (
        <span id={`${id}-hint`} className="text-[13px] text-muted-foreground">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="animate-in fade-in-0 slide-in-from-top-1 text-[13px] font-medium text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
