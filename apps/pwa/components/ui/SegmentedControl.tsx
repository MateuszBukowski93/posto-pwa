'use client';

import { useRovingFocus } from '@/lib/hooks/useRovingFocus';

type Option<T extends string> = { value: T; label: string; id?: string; controls?: string };

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** radiogroup (motyw) albo tablist (zakładki instalacji) */
  kind?: 'radio' | 'tab';
};

/** Przełącznik segmentowy: kontener 16 px, segmenty 12 px. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  kind = 'radio',
}: SegmentedControlProps<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value);
  const { getItemProps } = useRovingFocus(options.length, selectedIndex, (i) => onChange(options[i].value), {
    orientation: 'horizontal',
  });

  return (
    <div
      role={kind === 'radio' ? 'radiogroup' : 'tablist'}
      aria-label={label}
      className="grid gap-1 rounded-2xl bg-track p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            id={option.id}
            role={kind}
            aria-checked={kind === 'radio' ? selected : undefined}
            aria-selected={kind === 'tab' ? selected : undefined}
            aria-controls={option.controls}
            onClick={() => onChange(option.value)}
            {...getItemProps(index)}
            className={`min-h-11 rounded-xl border-none px-2 font-sans text-sm font-bold ${
              selected ? 'bg-seg-on text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]' : 'bg-transparent text-muted'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
