'use client';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelledBy: string;
  describedBy?: string;
  disabled?: boolean;
};

/** Przełącznik: tor 48×28 px, pole dotyku 52×44 px. */
export function Switch({ checked, onChange, labelledBy, describedBy, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex h-11 w-[52px] shrink-0 items-center justify-center border-none bg-transparent p-0 disabled:opacity-50"
    >
      <span
        className={`flex h-7 w-12 items-center rounded-full p-[3px] motion-safe:transition-colors ${checked ? 'bg-accent' : 'bg-off'}`}
      >
        <span
          className={`h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] motion-safe:transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </span>
    </button>
  );
}
