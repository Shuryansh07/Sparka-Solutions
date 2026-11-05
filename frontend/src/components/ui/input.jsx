import { cn } from '@/lib/utils';

const fieldBase =
  'w-full min-w-0 rounded-lg border border-input bg-background px-3.5 text-base shadow-xs outline-none transition-[color,box-shadow,border-color] duration-150 placeholder:text-muted-foreground/70 hover:border-[#a9bec1] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/15 md:text-[15px]';

function Input({ className, type, ...props }) {
  return <input type={type} data-slot="input" className={cn(fieldBase, 'h-11', className)} {...props} />;
}

export { Input, fieldBase };
