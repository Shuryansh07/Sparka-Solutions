import { X } from 'lucide-react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

function Sheet(props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetContent({ className, children, side = 'right', ...props }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-night/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 flex flex-col gap-4 shadow-2xl transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500',
          side === 'right' &&
            'inset-y-0 right-0 h-full w-[88%] max-w-sm border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          side === 'left' &&
            'inset-y-0 left-0 h-full w-[88%] max-w-sm border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 grid size-10 place-items-center rounded-lg opacity-80 transition-opacity hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
          <X className="size-5" />
          <span className="sr-only">Close menu</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetTitle({ className, ...props }) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn('font-semibold', className)} {...props} />;
}

function SheetDescription({ className, ...props }) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger };
