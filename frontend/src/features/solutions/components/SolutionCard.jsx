import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RevealItem } from '@/shared/components/Reveal';

// One cell of the hairline-divided category grid.
export default function SolutionCard({ icon: Icon, title, text, examples, highlight, detailed = false }) {
  return (
    <RevealItem
      as="article"
      className={cn(
        'group relative flex flex-col p-7 transition-colors duration-300 md:p-8',
        highlight ? 'bg-night text-white' : 'bg-background hover:bg-steel'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-11 place-items-center rounded-xl border transition-all duration-300',
          highlight
            ? 'border-spark/40 bg-spark/10 text-spark'
            : 'bg-background text-primary group-hover:border-spark/50 group-hover:text-[#b5871f] group-hover:shadow-[0_0_24px_-6px_var(--spark)]'
        )}
      >
        <Icon className="size-5" />
      </span>
      <h3 className="mt-6 text-lg leading-snug font-bold">{title}</h3>
      <p className={cn('mt-2 text-[15px] leading-relaxed', highlight ? 'text-white/65' : 'text-muted-foreground')}>{text}</p>
      {detailed && (
        <ul className="mt-5 grid gap-2 border-t pt-5 text-sm">
          {examples.map((e) => (
            <li key={e} className={cn('flex gap-2', highlight ? 'text-white/80' : 'text-foreground/80')}>
              <Check className={cn('mt-0.5 size-4 shrink-0', highlight ? 'text-spark' : 'text-primary')} aria-hidden="true" />
              {e}
            </li>
          ))}
        </ul>
      )}
    </RevealItem>
  );
}
