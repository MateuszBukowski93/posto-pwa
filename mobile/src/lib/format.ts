import { localDayDiff, pad2, splitDuration } from './domain/time';

/**
 * Formatowanie liczb i dat przez Intl. `locale` to „locale formatowania”
 * (np. 'pl', 'en-GB'), niekoniecznie identyczne z językiem komunikatów.
 */

const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();
/** null = brak obsługi `style: 'unit'` w tym silniku */
const unitFormats = new Map<string, Intl.NumberFormat | null>();

function numberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `n|${locale}|${JSON.stringify(options)}`;
  let f = cache.get(key) as Intl.NumberFormat | undefined;
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    cache.set(key, f);
  }
  return f;
}

function dateFormat(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `d|${locale}|${JSON.stringify(options)}`;
  let f = cache.get(key) as Intl.DateTimeFormat | undefined;
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    cache.set(key, f);
  }
  return f;
}

export function capitalize(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

export function formatNumber(locale: string, value: number, maxFraction = 1, minFraction = 0): string {
  return numberFormat(locale, {
    maximumFractionDigits: maxFraction,
    minimumFractionDigits: minFraction,
  }).format(value);
}

type Unit = 'kilogram' | 'liter';

/**
 * Jednostka, gdy silnik JS nie obsługuje `style: 'unit'` (Hermes na części urządzeń).
 * Wartości jak w CLDR dla obsługiwanych języków.
 */
export function fallbackUnitLabel(locale: string, unit: Unit): string {
  if (locale.startsWith('uk')) return unit === 'kilogram' ? 'кг' : 'л';
  if (unit === 'kilogram') return 'kg';
  return locale.startsWith('en') && locale !== 'en-GB' ? 'L' : 'l';
}

function formatUnit(locale: string, unit: Unit, value: number, maxFraction: number, minFraction: number): string {
  const key = `u|${locale}|${unit}|${maxFraction}|${minFraction}`;
  let f = unitFormats.get(key);
  if (f === undefined) {
    try {
      const candidate = new Intl.NumberFormat(locale, {
        style: 'unit',
        unit,
        unitDisplay: 'short',
        maximumFractionDigits: maxFraction,
        minimumFractionDigits: minFraction,
      });
      f = candidate.resolvedOptions().style === 'unit' ? candidate : null;
    } catch {
      f = null;
    }
    unitFormats.set(key, f);
  }
  if (f) return f.format(value);
  return `${formatNumber(locale, value, maxFraction, minFraction)}\u00a0${fallbackUnitLabel(locale, unit)}`;
}

/** 82,4 kg */
export function formatKg(locale: string, kg: number, fixed = false): string {
  return formatUnit(locale, 'kilogram', kg, 1, fixed ? 1 : 0);
}

/** 1,25 l */
export function formatLiters(locale: string, ml: number): string {
  return formatUnit(locale, 'liter', ml / 1000, 2, 0);
}

/** −0,3 / +0,1 / 0,0 (prawdziwy znak minus). */
export function formatSignedDelta(locale: string, value: number, fraction = 1): string {
  const rounded = Math.round(value * 10 ** fraction) / 10 ** fraction;
  const abs = formatNumber(locale, Math.abs(rounded), fraction, fraction);
  if (rounded > 0) return `+${abs}`;
  if (rounded < 0) return `−${abs}`;
  return abs;
}

/** Godzina zegarowa wg konwencji locale (24 h w PL, 12 h w en-US). */
export function formatTime(locale: string, ts: number): string {
  return dateFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(ts);
}

/** „Poniedziałek, 5 października” */
export function formatLongDate(locale: string, ts: number): string {
  return capitalize(dateFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(ts), locale);
}

/** „Sobota, 3 paź” */
export function formatMediumDate(locale: string, ts: number): string {
  return capitalize(dateFormat(locale, { weekday: 'long', day: 'numeric', month: 'short' }).format(ts), locale);
}

/** „Sobota” */
export function formatWeekday(locale: string, ts: number): string {
  return capitalize(dateFormat(locale, { weekday: 'long' }).format(ts), locale);
}

/** „5.10” (d.MM) w PL; w innych językach zgodnie z Intl. */
export function formatShortDate(locale: string, ts: number): string {
  return dateFormat(locale, { day: 'numeric', month: '2-digit' }).format(ts);
}

export type RelativeDay = 'today' | 'yesterday' | 'tomorrow' | 'dayBeforeYesterday' | null;

export function relativeDay(ts: number, now: number): RelativeDay {
  const diff = localDayDiff(ts, now);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff === -1) return 'tomorrow';
  if (diff === 2) return 'dayBeforeYesterday';
  return null;
}

/** Minuty dopełnione zerem do dwóch cyfr – używane w komunikatach „{h} h {m} min”. */
export function durationParams(ms: number): { h: number; m: string } {
  const { hours, minutes } = splitDuration(ms);
  return { h: hours, m: pad2(minutes) };
}
