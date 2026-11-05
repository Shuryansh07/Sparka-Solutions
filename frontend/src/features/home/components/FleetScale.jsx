import { RevealGroup, RevealItem } from '@/shared/components/Reveal';
import SectionHeading from '@/shared/components/SectionHeading';

const CARDS = [
  {
    img: '/images/fleet-convoy.jpg',
    alt: 'A convoy of freight trucks on a highway under a golden sunset',
    kicker: 'Large and national fleets',
    title: 'Support for operations at scale',
    text: 'Broad sourcing, multi-vehicle projects and coordinated solutions across locations.',
  },
  {
    img: '/images/fleet-vans.jpg',
    alt: 'A row of white service vans parked and ready for the day',
    kicker: 'Small and growing fleets',
    title: 'Personal attention for every vehicle',
    text: 'Practical solutions for local businesses, owner-operators and growing teams.',
  },
];

export default function FleetScale() {
  return (
    <section id="fleets" className="py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          title="Every fleet. Every size. Every need."
          intro="Whether you run a handful of vehicles or manage thousands, Sparka helps you find the right products, equipment and technology for your operation."
        />
        <RevealGroup className="grid gap-5 md:grid-cols-2">
          {CARDS.map((c) => (
            <RevealItem
              as="article"
              key={c.title}
              className="group relative isolate flex min-h-[380px] flex-col justify-end overflow-hidden rounded-3xl p-7 text-white md:min-h-[440px] md:p-9"
            >
              <img
                src={c.img}
                alt={c.alt}
                loading="lazy"
                width="700"
                height="400"
                className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-spark)] group-hover:scale-[1.06]"
              />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/70 to-night/5" />
              <span className="text-sm font-medium text-spark">{c.kicker}</span>
              <h3 className="type-wide mt-2 text-2xl font-bold md:text-3xl">{c.title}</h3>
              <p className="mt-2 max-w-md text-white/70">{c.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
