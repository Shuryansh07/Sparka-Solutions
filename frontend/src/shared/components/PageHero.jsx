import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.05 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

// Dark title band shared by inner pages. `kicker` is a short context line, not an all-caps label.
export default function PageHero({ kicker, title, intro, image, children, className }) {
  return (
    <section className={cn('relative isolate overflow-hidden bg-night text-white', className)}>
      {image && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 -z-10 hidden w-[46%] lg:block"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={image} alt="" decoding="async" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/60 to-night/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/80 to-transparent" />
        </motion.div>
      )}
      <div aria-hidden="true" className="bg-grid-night absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute -top-40 right-[-10%] -z-10 size-[520px] rounded-full bg-primary/25 blur-[120px]"
      />
      <div className="container-page pt-14 pb-16 md:pt-20 md:pb-20">
        {kicker && (
          <motion.p variants={rise} initial="hidden" animate="show" className="mb-4 flex items-center gap-2 text-sm font-medium text-spark">
            <span className="h-px w-6 bg-spark/70" aria-hidden="true" />
            {kicker}
          </motion.p>
        )}
        <motion.h1
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
          className="type-wide max-w-4xl text-[clamp(34px,5.4vw,64px)] leading-[1.02] font-extrabold"
        >
          {title}
        </motion.h1>
        {intro && (
          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-5 max-w-2xl text-[clamp(16px,1.5vw,18px)] leading-relaxed text-white/70"
          >
            {intro}
          </motion.p>
        )}
        {children && (
          <motion.div variants={rise} initial="hidden" animate="show" custom={3}>
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
