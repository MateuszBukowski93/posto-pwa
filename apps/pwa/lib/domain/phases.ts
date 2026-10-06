import { HOUR } from './time';

export type PhaseId = 'digestion' | 'stabilization' | 'fatBurning' | 'ketosis';

export type Phase = {
  id: PhaseId;
  fromHours: number;
  /** null = faza otwarta (18 h+) */
  toHours: number | null;
  /** szerokość segmentu na pasku faz */
  weight: number;
};

export const PHASES: readonly Phase[] = [
  { id: 'digestion', fromHours: 0, toHours: 4, weight: 4 },
  { id: 'stabilization', fromHours: 4, toHours: 12, weight: 8 },
  { id: 'fatBurning', fromHours: 12, toHours: 18, weight: 6 },
  { id: 'ketosis', fromHours: 18, toHours: null, weight: 6 },
];

export function phaseIndexAt(elapsedMs: number): number {
  const hours = Math.max(0, elapsedMs) / HOUR;
  const index = PHASES.findIndex((p) => hours >= p.fromHours && (p.toHours === null || hours < p.toHours));
  return index === -1 ? PHASES.length - 1 : index;
}

export function phaseAt(elapsedMs: number): Phase {
  return PHASES[phaseIndexAt(elapsedMs)];
}

export type PhaseSegment = { id: PhaseId; weight: number; reached: boolean };

/** Segmenty paska: ukończone i bieżący są „reached”. */
export function phaseSegments(elapsedMs: number): PhaseSegment[] {
  const current = phaseIndexAt(elapsedMs);
  return PHASES.map((p, i) => ({ id: p.id, weight: p.weight, reached: i <= current }));
}
