import { describe, expect, it } from 'vitest';
import { phaseAt, phaseIndexAt, phaseSegments } from './phases';
import { HOUR } from './time';

describe('phases', () => {
  it('przypisuje fazy wg godzin od startu', () => {
    expect(phaseAt(0).id).toBe('digestion');
    expect(phaseAt(3.99 * HOUR).id).toBe('digestion');
    expect(phaseAt(4 * HOUR).id).toBe('stabilization');
    expect(phaseAt(11.99 * HOUR).id).toBe('stabilization');
    expect(phaseAt(12 * HOUR).id).toBe('fatBurning');
    expect(phaseAt(18 * HOUR).id).toBe('ketosis');
    expect(phaseAt(40 * HOUR).id).toBe('ketosis');
    expect(phaseIndexAt(-1)).toBe(0);
  });

  it('segmenty mają szerokości 4, 8, 6, 6 i oznaczają ukończone + bieżący', () => {
    const segments = phaseSegments(14.5 * HOUR);
    expect(segments.map((s) => s.weight)).toEqual([4, 8, 6, 6]);
    expect(segments.map((s) => s.reached)).toEqual([true, true, true, false]);
    expect(phaseSegments(0).map((s) => s.reached)).toEqual([true, false, false, false]);
  });
});
