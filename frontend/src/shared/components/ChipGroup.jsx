import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChipGroup({ options, value = [], onChange, label }) {
  const toggle = (option) => onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((option) => {
        const on = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(option)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium outline-none transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/40 active:scale-[0.97]',
              on
                ? 'border-primary bg-primary text-primary-foreground shadow-[0_6px_16px_-8px_var(--primary)]'
                : 'bg-background hover:border-primary/40 hover:bg-steel'
            )}
          >
            {on ? <Check className="size-3.5" strokeWidth={3} /> : <Plus className="size-3.5" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}
