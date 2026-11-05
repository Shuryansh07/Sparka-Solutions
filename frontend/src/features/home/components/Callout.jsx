import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Callout() {
  return (
    <section className="bg-steel py-20 md:py-24">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative isolate overflow-hidden rounded-[2rem] bg-night px-6 py-14 text-center text-white sm:px-12 md:py-20"
        >
          <div aria-hidden="true" className="bg-grid-night absolute inset-0 -z-10" />
          <div
            aria-hidden="true"
            className="absolute bottom-[-60%] left-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-spark/25 blur-[120px]"
          />
          <img
            src="/images/logo-mark.jpg"
            alt=""
            width="64"
            height="64"
            className="mx-auto mb-7 size-16 rounded-full shadow-[0_0_48px_-4px_var(--spark)] ring-1 ring-white/20"
          />
          <h2 className="type-wide mx-auto max-w-3xl text-[clamp(28px,4.2vw,52px)] leading-[1.04] font-extrabold">
            Tell us what you’re trying to accomplish.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] text-white/70">
            Answer a few questions about your fleet. We’ll use your answers to start exploring suitable options.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild variant="spark" size="lg" className="group">
              <Link to="/discovery">
                Start Discovery
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link to="/discovery/talk">Talk to a person</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
