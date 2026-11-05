import { Zap } from 'lucide-react';
import SectionHeading from '@/shared/components/SectionHeading';
import { BREADTH_CHIPS } from '@/shared/data/site';
import { cn } from '@/lib/utils';

function Row({ items, reverse }) {
  // The list is rendered twice so the loop is seamless; the copy is hidden from assistive tech.
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className={cn(
            'animate-marquee flex shrink-0 gap-3 pr-3 group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]'
          )}
        >
          {items.map((c, i) => (
            <li
              key={`${c}-${i}`}
              className="flex items-center gap-2.5 rounded-full border bg-background px-5 py-3 text-[15px] font-medium whitespace-nowrap shadow-[0_1px_2px_rgb(7_27_32/0.05)]"
            >
              <Zap className="size-4 fill-spark text-spark" aria-hidden="true" />
              {c}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export default function Breadth() {
  const half = Math.ceil(BREADTH_CHIPS.length / 2);
  return (
    <section className="overflow-hidden border-y bg-steel py-20 md:py-24">
      <div className="container-page">
        <SectionHeading
          align="center"
          title="If your fleet needs it, start with Sparka."
          intro="Equipment, parts, accessories, technology, vehicle outfitting and specialty requests. Our job is to research and source the right fit, not to limit you to a short catalog."
        />
      </div>
      <div className="grid gap-3">
        <Row items={[...BREADTH_CHIPS.slice(0, half), ...BREADTH_CHIPS.slice(0, half)]} />
        <Row items={[...BREADTH_CHIPS.slice(half), ...BREADTH_CHIPS.slice(half)]} reverse />
      </div>
    </section>
  );
}
