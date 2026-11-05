import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageHero from '@/shared/components/PageHero';
import { RevealGroup, RevealItem } from '@/shared/components/Reveal';
import SectionHeading from '@/shared/components/SectionHeading';
import PathCards from '../discovery/components/PathCards';
import SolutionGrid from './components/SolutionGrid';

const APPROACH = [
  { title: 'Listen first', text: 'We start with your operation, goals and constraints, not with a product to sell.' },
  { title: 'Research options', text: 'We compare suitable products across manufacturers and verify fit and availability.' },
  { title: 'Recommend with people', text: 'A representative reviews findings with you before any estimate or proposal.' },
  { title: 'Source and support', text: 'We coordinate sourcing, delivery, installation through qualified providers, and follow-up.' },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        kicker="Solutions and approach"
        image="/images/fleet-vans.jpg"
        title="Everything your fleet needs. One place to start."
        intro="Sparka is manufacturer-independent. We research and source across a broad marketplace of commercial fleet products. These categories are examples, not the limits of what we can find."
      />

      <section className="py-20 md:py-28">
        <div className="container-page">
          <SectionHeading title="A human-first process, from first question to follow-up." />
          <RevealGroup as="ol" stagger={0.1} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {APPROACH.map((a, i) => (
              <RevealItem as="li" key={a.title} className="relative border-t-2 border-border pt-6">
                <span
                  aria-hidden="true"
                  className="absolute -top-[2px] left-0 h-0.5 w-12 bg-gradient-to-r from-primary to-spark"
                />
                <span className="type-wide text-sm font-bold text-primary">Step {i + 1}</span>
                <h3 className="mt-2 text-xl font-bold">{a.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{a.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-y bg-steel py-20 md:py-28">
        <div className="container-page">
          <SectionHeading
            title="What we help fleets source"
            intro="From a single replacement accessory to a complex, multi-vehicle project."
          />
          <SolutionGrid detailed />
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-page">
          <SectionHeading title="Three ways to begin. All equally welcome." />
          <PathCards />
          <div className="mt-8 flex justify-center">
            <Button asChild variant="ghost" className="group">
              <Link to="/contact">
                Or contact us directly
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
