import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

function Card({ className, asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : 'div';
  return (
    <Comp
      data-slot="card"
      className={cn(
        'flex flex-col gap-6 rounded-2xl border bg-card text-card-foreground shadow-[0_1px_2px_rgb(7_27_32/0.04),0_16px_48px_-24px_rgb(7_27_32/0.22)]',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn('grid gap-1.5 px-6 pt-6', className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return (
    <div data-slot="card-title" className={cn('font-display text-lg leading-tight font-semibold', className)} {...props} />
  );
}

function CardDescription({ className, ...props }) {
  return <div data-slot="card-description" className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn('flex items-center px-6 pb-6', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
