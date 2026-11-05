import { Check } from 'lucide-react';

// Accessible single-select (radiogroup) or multi-select (toggle buttons) tiles.
export default function OptionGroup({ options, value, multiple = false, onChange, label }) {
  const selected = multiple ? value || [] : value;

  const toggle = (option) => {
    if (!multiple) return onChange(option);
    onChange(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);
  };

  return (
    <div className="options" role={multiple ? 'group' : 'radiogroup'} aria-label={label}>
      {options.map((option) => {
        const isOn = multiple ? selected.includes(option) : selected === option;
        const stateProp = multiple ? { 'aria-pressed': isOn } : { role: 'radio', 'aria-checked': isOn };
        return (
          <button
            key={option}
            type="button"
            className={`option${multiple ? ' option--multi' : ''}`}
            onClick={() => toggle(option)}
            {...stateProp}
          >
            <span className="option__mark" aria-hidden="true">
              {isOn && <Check strokeWidth={3} />}
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
}
