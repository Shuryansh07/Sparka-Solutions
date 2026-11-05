import { RevealGroup, RevealItem } from '@/shared/components/Reveal';

const PILLARS = ['Knowledge', 'Relationships', 'Execution'];

export default function Experience() {
  return (
    <section id="about" className="relative isolate overflow-hidden bg-night py-20 text-white md:py-28">
      <div aria-hidden="true" className="bg-grid-night absolute inset-0 -z-10 opacity-70" />
      <div aria-hidden="true" className="absolute -right-40 bottom-[-30%] -z-10 size-[560px] rounded-full bg-primary/20 blur-[140px]" />

      <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div className="group relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 p-7 md:min-h-[520px] md:p-10">
          <img
            src="/images/tech-dashboard.jpg"
            alt="A vehicle dashboard at night with a glowing navigation map on the center screen"
            loading="lazy"
            width="1100"
            height="1300"
            className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-[1.6s] ease-[var(--ease-spark)] group-hover:scale-105"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/55 to-transparent" />
          <RevealGroup stagger={0.12} aria-hidden="true" className="grid gap-0.5">
            {PILLARS.map((p, i) => (
              <RevealItem key={p} className="flex items-baseline gap-3">
                <span className="type-wide text-chrome text-[clamp(32px,4.4vw,56px)] leading-[1.04] font-extrabold">{p}</span>
                {i < PILLARS.length - 1 && <span className="font-display text-2xl font-light text-spark">×</span>}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <div>
          <h2 className="type-wide text-[clamp(28px,3.4vw,42px)] leading-[1.08] font-bold">
            Decades of industry knowledge, working for you.
          </h2>
          <div className="my-6 h-0.5 w-14 rounded-full bg-spark" aria-hidden="true" />
          <div className="grid gap-4 text-[17px] leading-relaxed text-white/70">
            <p>
              Sparka draws on experienced industry professionals, technical know-how, and relationships across the fleet
              ecosystem. We combine that perspective with careful research and human review to help you make informed
              purchasing decisions.
            </p>
            <p>
              Our role doesn’t end at finding a product. Where needed, we help coordinate practical implementation and
              installation support through qualified providers.
            </p>
          </div>
          <p className="mt-6 border-l-2 border-white/15 pl-4 text-sm text-white/45">
            Sparka is a new company drawing on the experience of its people and network; this is not a claim that
            Sparka itself has operated for decades.
          </p>
        </div>
      </div>
    </section>
  );
}
