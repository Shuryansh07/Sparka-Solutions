import { Check, Plus } from 'lucide-react';

export default function ChipGroup({ options, value = [], onChange, label }) {
  const toggle = (option) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((option) => {
        const on = value.includes(option);
        return (
          <button key={option} type="button" className="chip" aria-pressed={on} onClick={() => toggle(option)}>
            {on ? <Check strokeWidth={3} /> : <Plus />}
            {option}
          </button>
        );
      })}
    </div>
  );
}
