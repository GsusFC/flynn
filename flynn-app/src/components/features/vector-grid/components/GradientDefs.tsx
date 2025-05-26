import React from 'react';
import type { GradientConfig } from '../types/gradientTypes';

interface GradientDefsProps {
  gradients: Array<{
    id: string;
    config: GradientConfig;
  }>;
}

export const GradientDefs: React.FC<GradientDefsProps> = ({ gradients }) => {
  if (gradients.length === 0) return null;

  return (
    <defs>
      {gradients.map(({ id, config }) => {
        if (config.type === 'linear') {
          // Calcular coordenadas basadas en el ángulo
          const angleRad = ((config.angle || 0) * Math.PI) / 180;
          const x1 = 50 - 50 * Math.cos(angleRad);
          const y1 = 50 - 50 * Math.sin(angleRad);
          const x2 = 50 + 50 * Math.cos(angleRad);
          const y2 = 50 + 50 * Math.sin(angleRad);

          return (
            <linearGradient
              key={id}
              id={id}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              gradientUnits="objectBoundingBox"
            >
              {config.colors.map((colorStop, index) => (
                <stop
                  key={index}
                  offset={`${colorStop.offset * 100}%`}
                  stopColor={colorStop.color}
                />
              ))}
            </linearGradient>
          );
        } else if (config.type === 'radial') {
          return (
            <radialGradient
              key={id}
              id={id}
              cx={`${(config.centerX || 0.5) * 100}%`}
              cy={`${(config.centerY || 0.5) * 100}%`}
              r={`${(config.radius || 0.5) * 100}%`}
              gradientUnits="objectBoundingBox"
            >
              {config.colors.map((colorStop, index) => (
                <stop
                  key={index}
                  offset={`${colorStop.offset * 100}%`}
                  stopColor={colorStop.color}
                />
              ))}
            </radialGradient>
          );
        }

        return null;
      })}
    </defs>
  );
};
