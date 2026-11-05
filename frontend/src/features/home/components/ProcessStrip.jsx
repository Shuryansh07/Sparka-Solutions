import { motion } from 'motion/react';
import { RevealGroup, RevealItem } from '@/shared/components/Reveal';
import SectionHeading from '@/shared/components/SectionHeading';
import { PROCESS_STEPS } from '@/shared/data/site';

export default function ProcessStrip() {
  return (
    <section id="how" aria-labelledby="how-title" className="bg-steel py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          id="how-title"
          title="How it works"
          intro="Three steps from your first question to products on your vehicles, with a person alongside you the whole way."
        />

        <div className="relative">
          {/* Connecting track: draws left to right as the steps come into view. */}
          <div aria-hidden="true" className="absolute top-7 right-[16%] left-[16%] hidden h-px bg-border md:block">
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-primary via-teal-bright to-spark"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '0px 0px -20% 0px' }}
              transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
            />
          </div>

          <RevealGroup as="ol" stagger={0.18} className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {PROCESS_STEPS.map((s) => (
              <RevealItem as="li" key={s.num} className="flex gap-5 md:flex-col md:items-center md:text-center">
                <span className="type-wide relative grid size-14 shrink-0 place-items-center rounded-2xl border bg-background text-lg font-bold text-primary shadow-[0_8px_24px_-12px_rgb(7_27_32/0.25)]">
                  {s.num}
                </span>
                <div>
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-muted-foreground">{s.text}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
