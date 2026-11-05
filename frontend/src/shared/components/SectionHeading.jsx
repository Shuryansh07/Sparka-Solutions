import { cn } from '@/lib/utils';

export default function SectionHeading({ title, intro, id, align = 'left', className }) {
  return (
    <div className={cn('mb-10 max-w-2xl md:mb-14', align === 'center' && 'mx-auto text-center', className)}>
      <h2 id={id} className="type-wide text-[clamp(28px,3.6vw,44px)] leading-[1.06] font-bold">
        {title}
      </h2>
      {intro && <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{intro}</p>}
    </div>
  );
}
