import { useLayoutEffect, useRef } from 'react';

// FLIP: los hijos con data-flip que cambian de posición entre renders se deslizan a su nuevo sitio
// (usa offsetLeft/Top: no les afectan transformaciones en curso ni el scroll).
export function useFlip(ref) {
  const prev = useRef(new Map());
  useLayoutEffect(() => {
    const next = new Map();
    for (const el of ref.current?.children || []) {
      const k = el.dataset.flip;
      if (!k) continue;
      const pos = { x: el.offsetLeft, y: el.offsetTop };
      next.set(k, pos);
      const p = prev.current.get(k);
      if (p && (Math.abs(p.x - pos.x) > 1 || Math.abs(p.y - pos.y) > 1)) {
        el.animate([{ transform: `translate(${p.x - pos.x}px, ${p.y - pos.y}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    }
    prev.current = next;
  });
}
