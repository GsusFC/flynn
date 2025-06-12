'use client';

import { useState, useEffect, RefObject } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

export const useMousePosition = (ref: RefObject<HTMLElement>): MousePosition => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setMousePos({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    const target = ref.current ? ref.current.ownerDocument.defaultView : window;
    if (target) {
      target.addEventListener('mousemove', handleMouseMove as EventListener);
    }

    return () => {
      if (target) {
        target.removeEventListener('mousemove', handleMouseMove as EventListener);
      }
    };
  }, [ref]);

  return mousePos;
};
