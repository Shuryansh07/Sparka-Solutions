import { Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

// Accessible single-select (radiogroup) or multi-select (toggle buttons) tiles.
export default function OptionGroup({ options, value, multiple = false, onChange, label }) {
  const selected = multiple ? value || [] : value;

  const toggle = (option) => {
    if (!multiple) return onChange(option);
    onChange(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);
  };

  return (
    <div
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={label}
    >
      {options.map((option, i) => {
        const isOn = multiple ? selected.includes(option) : selected === option;
        const stateProp = multiple ? { 'aria-pressed': isOn } : { role: 'radio', 'aria-checked': isOn };
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'group flex min-h-14 items-center gap-3 rounded-xl border bg-background px-4 py-3 text-left text-[15px] font-medium outline-none transition-[border-color,background-color,box-shadow] duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/40',
              isOn
                ? 'border-primary bg-accent/70 shadow-[inset_0_0_0_1px_var(--primary)]'
                : 'hover:border-primary/40 hover:bg-steel'
            )}
            {...stateProp}
          >
            <span
              aria-hidden="true"
              className={cn(
                'grid size-5 shrink-0 place-items-center border-[1.5px] transition-colors duration-200',
                multiple ? 'rounded-md' : 'rounded-full',
                isOn ? 'border-primary bg-primary text-white' : 'border-[#9db4b7] group-hover:border-primary/60'
              )}
            >
              <AnimatePresence>
                {isOn && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                  >
                    <Check className="size-3" strokeWidth={3.5} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            {option}
          </motion.button>
        );
      })}
    </div>
  );
}
