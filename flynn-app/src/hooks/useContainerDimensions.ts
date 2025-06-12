'use client';

import { useState, useEffect, RefObject } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

export const useContainerDimensions = (
  ref: RefObject<HTMLElement>,
  fixedWidth?: number,
  fixedHeight?: number
): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 800, height: 600 });

  useEffect(() => {
    if (fixedWidth && fixedHeight) {
      setDimensions({ width: fixedWidth, height: fixedHeight });
      return;
    }

    const element = ref.current;

    const handleResize = () => {
      if (element) {
        const { width, height } = element.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    };

    if (element) {
      handleResize();
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(element);
      
      return () => {
        resizeObserver.unobserve(element);
      };
    }
  }, [ref, fixedWidth, fixedHeight]);

  return dimensions;
}; 