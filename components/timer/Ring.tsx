const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = 124;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // 779.11

type RingProps = {
  /** 0..1 */
  progress: number;
  /** 0..1 – drugie, cieńsze okrążenie po przekroczeniu celu */
  overflow?: number;
  color: 'accent' | 'water';
  label: string;
  labelTone: 'accent' | 'water';
  time: string;
  sub: string;
  pulse?: boolean;
};

/** Pierścień 280×280: tor 18 px, łuk z zaokrąglonymi końcami, start na godzinie 12. */
export function Ring({ progress, overflow = 0, color, label, labelTone, time, sub, pulse }: RingProps) {
  const arc = (value: number) => (CIRCUMFERENCE * (1 - Math.min(Math.max(value, 0), 1))).toFixed(2);
  return (
    <div className="relative h-[280px] w-[280px]">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        className={`absolute inset-0 ${pulse ? 'anim-goal-pulse' : ''}`}
      >
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" strokeWidth={18} style={{ stroke: 'var(--track)' }} />
        {progress > 0 ? (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            strokeWidth={18}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE.toFixed(2)}
            strokeDashoffset={arc(progress)}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            style={{ stroke: `var(--${color})` }}
          />
        ) : null}
        {overflow > 0 ? (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE.toFixed(2)}
            strokeDashoffset={arc(overflow)}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            style={{ stroke: 'var(--accent-text)' }}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-8 text-center">
        <span
          className={`text-[13px] font-bold tracking-[0.12em] uppercase ${labelTone === 'accent' ? 'text-accent-text' : 'text-water-text'}`}
        >
          {label}
        </span>
        <span
          data-testid="timer-clock"
          className="font-display text-[54px] leading-none font-bold tracking-[-0.03em] tabular-nums"
        >
          {time}
        </span>
        <span className="text-sm text-muted tabular-nums">{sub}</span>
      </div>
    </div>
  );
}
