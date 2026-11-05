import { motion } from 'motion/react';

const ease = [0.22, 1, 0.36, 1];

// Staggered reveal for a group of items as it scrolls into view. Use on groups, not every section.
export function RevealGroup({ as = 'div', className, children, stagger = 0.07, ...props }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      {...props}
    >
      {children}
    </Comp>
  );
}

export const revealItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function RevealItem({ as = 'div', className, children, ...props }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={revealItem} {...props}>
      {children}
    </Comp>
  );
}
