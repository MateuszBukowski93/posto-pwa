'use client';

import { useCallback, useRef, type KeyboardEvent } from 'react';

/**
 * Nawigacja strzałkami w grupie radio/zakładek (roving tabindex).
 * `selectOnMove` – czy strzałka od razu zaznacza (wzorzec ARIA radio),
 * czy tylko przenosi fokus (np. lista języków, gdzie wybór zamyka arkusz).
 */
export function useRovingFocus(
  count: number,
  selectedIndex: number,
  onSelect: (index: number) => void,
  {
    selectOnMove = true,
    orientation = 'both',
  }: { selectOnMove?: boolean; orientation?: 'horizontal' | 'vertical' | 'both' } = {},
) {
  const refs = useRef<Array<HTMLElement | null>>([]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, index: number) => {
      const next = orientation !== 'vertical' ? ['ArrowRight'] : [];
      const prev = orientation !== 'vertical' ? ['ArrowLeft'] : [];
      if (orientation !== 'horizontal') {
        next.push('ArrowDown');
        prev.push('ArrowUp');
      }
      let target: number | null = null;
      if (next.includes(event.key)) target = (index + 1) % count;
      else if (prev.includes(event.key)) target = (index - 1 + count) % count;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = count - 1;
      if (target === null) return;
      event.preventDefault();
      refs.current[target]?.focus();
      if (selectOnMove) onSelect(target);
    },
    [count, onSelect, orientation, selectOnMove],
  );

  const getItemProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      refs.current[index] = el;
    },
    tabIndex: index === (selectedIndex >= 0 ? selectedIndex : 0) ? 0 : -1,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => onKeyDown(event, index),
  });

  return { getItemProps };
}
