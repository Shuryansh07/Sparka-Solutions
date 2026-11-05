import { cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-spark)] outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-[#0c6a6e] hover:shadow-[0_8px_24px_-10px_rgb(15_124_129/0.7)]',
        spark:
          'bg-spark text-night shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_10px_30px_-12px_var(--spark)] hover:bg-spark-soft hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_14px_36px_-12px_var(--spark)]',
        outline:
          'border border-input bg-background shadow-xs hover:border-primary/60 hover:bg-accent hover:text-accent-foreground',
        'outline-light':
          'border border-white/20 bg-white/[0.04] text-white backdrop-blur-sm hover:border-white/45 hover:bg-white/[0.09]',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        ghost: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 has-[>svg]:px-3.5',
        sm: 'h-9 gap-1.5 rounded-md px-3.5 has-[>svg]:px-3',
        lg: 'h-12 px-6 text-[15px] has-[>svg]:px-5',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
