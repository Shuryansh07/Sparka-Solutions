import { cn } from '@/lib/utils';
import { fieldBase } from './input';

function Textarea({ className, ...props }) {
  return (
    <textarea data-slot="textarea" className={cn(fieldBase, 'min-h-28 resize-y py-3 leading-relaxed', className)} {...props} />
  );
}

export { Textarea };
