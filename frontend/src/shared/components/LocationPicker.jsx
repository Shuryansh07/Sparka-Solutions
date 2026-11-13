import { Plus, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { US_STATES, formatLocation, joinLocations, parseLocation, splitLocations } from '@/shared/lib/us-locations';

// City lists (US Census Gazetteer places) are static files, one per state, fetched on demand.
const cityCache = new Map();
function loadCities(code) {
  if (!cityCache.has(code)) {
    cityCache.set(
      code,
      fetch(`/data/us-cities/${code}.json`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => {
          cityCache.delete(code); // allow a retry after a network blip
          return [];
        })
    );
  }
  return cityCache.get(code);
}

function useCities(code) {
  const [state, setState] = useState({ code: '', cities: [] });
  useEffect(() => {
    let live = true;
    if (code) loadCities(code).then((cities) => live && setState({ code, cities }));
    return () => {
      live = false;
    };
  }, [code]);
  const ready = state.code === code;
  return { cities: ready ? state.cities : [], loading: Boolean(code) && !ready };
}

const STATE_OPTIONS = US_STATES.map((s) => ({ value: s.code, label: s.name }));

/** Searchable State and City dropdowns; the city list follows the chosen state. */
function StateCityFields({ state, city, onChange, idPrefix, stacked }) {
  const { cities, loading } = useCities(state);
  return (
    <div className={cn('grid gap-3', !stacked && 'sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]')}>
      <span className="sr-only" id={`${idPrefix}-state-label`}>
        State
      </span>
      <Combobox
        aria-labelledby={`${idPrefix}-state-label`}
        options={STATE_OPTIONS}
        value={state}
        placeholder="State"
        searchPlaceholder="Search states…"
        emptyText="No state matches"
        // Switching between states clears the city; picking a first state keeps a city typed before it.
        onChange={(next) => onChange({ state: next, city: state && next !== state ? '' : city })}
      />
      <span className="sr-only" id={`${idPrefix}-city-label`}>
        City
      </span>
      <Combobox
        aria-labelledby={`${idPrefix}-city-label`}
        options={cities}
        value={city}
        loading={loading}
        allowCustom
        placeholder={state ? 'City' : 'City (choose a state first)'}
        searchPlaceholder={state ? 'Search cities…' : 'Type a place…'}
        emptyText={state ? 'No city matches. Use what you typed below.' : 'Choose a state to see its cities.'}
        onChange={(next) => onChange({ state, city: next.slice(0, 80) })}
      />
    </div>
  );
}

/**
 * US location input. The value is a plain string so the API and CRM stay unchanged:
 * "Dallas, TX", "Texas" (state only), or, with `multiple`, "Dallas, TX; Houston, TX".
 * Text that is not a recognizable US location (e.g. "Midwest") is kept as typed.
 */
export default function LocationPicker({ label, value, onChange, optional = false, multiple = false, stacked = false, hint, className }) {
  const id = useId();

  if (!multiple) {
    const { state, city } = parseLocation(value);
    return (
      <div className={cn('grid content-start gap-2', className)} role="group" aria-labelledby={`${id}-label`}>
        <PickerLabel id={id} label={label} optional={optional} />
        <StateCityFields idPrefix={id} stacked={stacked} state={state} city={city} onChange={(next) => onChange(formatLocation(next))} />
        {hint && <span className="text-[13px] text-muted-foreground">{hint}</span>}
      </div>
    );
  }

  return (
    <MultiLocationPicker id={id} label={label} value={value} onChange={onChange} optional={optional} stacked={stacked} hint={hint} className={className} />
  );
}

function PickerLabel({ id, label, optional }) {
  if (!label) return <span id={`${id}-label`} className="sr-only">Location</span>;
  return (
    <Label asChild>
      <span id={`${id}-label`}>
        {label}
        {optional && <span className="font-normal text-muted-foreground">Optional</span>}
      </span>
    </Label>
  );
}

function MultiLocationPicker({ id, label, value, onChange, optional, stacked, hint, className }) {
  const items = splitLocations(value);
  const [draft, setDraft] = useState({ state: '', city: '' });
  const canAdd = Boolean(draft.state || draft.city.trim());

  const add = (entry = draft) => {
    const next = formatLocation(entry);
    if (next && !items.includes(next)) onChange(joinLocations([...items, next]));
    setDraft({ state: entry.state, city: '' }); // keep the state: the next city is often in the same one
  };
  // Choosing a city adds it right away; "Add" with no city adds the whole state.
  const onDraftChange = (next) => (next.city && next.city !== draft.city ? add(next) : setDraft(next));
  const remove = (item) => onChange(joinLocations(items.filter((i) => i !== item)));

  return (
    <div className={cn('grid content-start gap-2', className)} role="group" aria-labelledby={`${id}-label`}>
      <PickerLabel id={id} label={label} optional={optional} />

      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Added locations">
          {items.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-1 rounded-full border bg-steel py-1 pr-1 pl-3 text-sm font-medium"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                aria-label={`Remove ${item}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={cn('grid gap-3', !stacked && 'sm:grid-cols-[minmax(0,1fr)_auto]')}>
        <StateCityFields idPrefix={id} stacked={stacked} state={draft.state} city={draft.city} onChange={onDraftChange} />
        <Button type="button" variant="outline" className="h-11" disabled={!canAdd} onClick={() => add()}>
          <Plus /> Add
        </Button>
      </div>
      <span className="text-[13px] text-muted-foreground">
        {hint || 'Pick a state, then a city to add it. To add a whole state, pick it and press Add.'}
      </span>
    </div>
  );
}
