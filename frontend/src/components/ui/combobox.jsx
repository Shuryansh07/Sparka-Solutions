import { Check, ChevronDown, Loader2, Plus, Search } from 'lucide-react';
import { Popover } from 'radix-ui';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { fieldBase } from './input';

const normalize = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

// Best matches first: whole label starts with the query, then a word does, then anywhere.
function rank(options, query, limit) {
  const q = normalize(query);
  if (!q) return { items: options.slice(0, limit), total: options.length };
  const starts = [];
  const wordStarts = [];
  const contains = [];
  for (const o of options) {
    const label = o.search;
    const at = label.indexOf(q);
    if (at === 0) starts.push(o);
    else if (at > 0 && /[\s\-/(.']/.test(label[at - 1])) wordStarts.push(o);
    else if (at > 0) contains.push(o);
  }
  const all = [...starts, ...wordStarts, ...contains];
  return { items: all.slice(0, limit), total: all.length };
}

/**
 * Searchable dropdown (not the browser's native select). Opens a panel with a search box
 * and a keyboard-navigable list. `options` are strings or { value, label }.
 * With `allowCustom`, a typed value that isn't listed can be used as-is.
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No matches',
  allowCustom = false,
  loading = false,
  disabled = false,
  maxResults = 100,
  className,
  contentClassName,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  const normalized = useMemo(
    () =>
      (options || []).map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        return { ...opt, search: normalize(opt.label) };
      }),
    [options]
  );
  const selected = normalized.find((o) => o.value === value);
  const displayLabel = selected?.label || value || '';

  const { items, total } = useMemo(() => rank(normalized, query, maxResults), [normalized, query, maxResults]);
  const typed = query.trim();
  const exact = typed && normalized.some((o) => o.search === normalize(typed));
  const custom = allowCustom && typed && !exact ? { value: typed, label: `Use “${typed}”`, custom: true } : null;
  const rows = custom ? [...items, custom] : items;

  // Reset the search each time the panel opens; start on the selected option.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    const i = normalized.findIndex((o) => o.value === value);
    setActive(i >= 0 && i < maxResults ? i : 0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setActive((a) => (query ? 0 : a)), [query]);

  // Keep the highlighted option in view while moving with the keyboard.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (row) => {
    if (!row) return;
    onChange(row.value);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    const last = rows.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a >= last ? 0 : a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? last : a - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(last);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(rows[active]);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={cn(
            fieldBase,
            'flex h-11 cursor-pointer items-center justify-between gap-2 text-left data-[state=open]:border-ring data-[state=open]:ring-[3px] data-[state=open]:ring-ring/25',
            className
          )}
        >
          <span className={cn('truncate', !displayLabel && 'text-muted-foreground/70')}>{displayLabel || placeholder}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            e.currentTarget.querySelector('input')?.focus();
          }}
          className={cn(
            'z-[200] w-[var(--radix-popover-trigger-width)] min-w-56 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-[0_18px_44px_-14px_rgb(7_27_32/0.28)]',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
            contentClassName
          )}
        >
          <div className="flex items-center gap-2 border-b px-3">
            <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            <input
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={rows[active] ? `${id}-opt-${active}` : undefined}
              aria-label={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              autoComplete="off"
              className="h-11 w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70"
            />
          </div>

          <ul ref={listRef} id={listId} role="listbox" className="max-h-72 overflow-y-auto overscroll-contain p-1.5">
            {loading && (
              <li className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground" role="presentation">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading…
              </li>
            )}
            {!loading && rows.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground" role="presentation">
                {emptyText}
              </li>
            )}
            {!loading &&
              rows.map((row, i) => {
                const isSelected = !row.custom && row.value === value;
                return (
                  <li
                    key={`${row.custom ? 'custom:' : ''}${row.value}`}
                    id={`${id}-opt-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSelected}
                    onMouseMove={() => active !== i && setActive(i)}
                    onMouseDown={(e) => e.preventDefault()} // keep focus in the search box
                    onClick={() => choose(row)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] select-none',
                      i === active && 'bg-accent text-accent-foreground',
                      isSelected && 'font-semibold text-primary',
                      row.custom && 'border-t mt-1 pt-3 text-primary'
                    )}
                  >
                    {row.custom ? (
                      <Plus className="size-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <Check className={cn('size-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                    )}
                    <span className="truncate">{row.label}</span>
                  </li>
                );
              })}
          </ul>

          {!loading && total > items.length && (
            <p className="border-t px-3 py-2 text-[12px] text-muted-foreground">
              Showing {items.length} of {total.toLocaleString()}. Keep typing to narrow it down.
            </p>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
