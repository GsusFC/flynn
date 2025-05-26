import React from 'react';
import type { VectorShape, VectorColorValue, StrokeLinecap, RotationOrigin } from './core/types';

interface RenderedVectorProps {
  id: string; // Para la key en el map
  baseX: number;
  baseY: number;
  currentAngle: number;
  length: number;
  width: number;
  color: VectorColorValue;
  shape: VectorShape;
  strokeLinecap?: StrokeLinecap;
  rotationOrigin?: RotationOrigin;
}

export const RenderedVector: React.FC<RenderedVectorProps> = React.memo(({
  baseX,
  baseY,
  currentAngle,
  length,
  width,
  color,
  shape,
  strokeLinecap = 'butt', // Default strokeLinecap
  rotationOrigin = 'center', // Default rotation origin
}) => {
  // Asegurarse de que el color sea un string para SVG
  const strokeColor = typeof color === 'string' ? color : `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a ?? 1})`;

  // Dejamos los props de estilo separados de la transformación para mayor claridad
  const vectorProps = {
    stroke: strokeColor,
    strokeWidth: width,
    strokeLinecap: strokeLinecap,
    fill: 'none', // Generalmente los vectores no tienen relleno, a menos que sean formas cerradas
  };
  
  // Calcular el punto de rotación basado en rotationOrigin
  const halfLength = length / 2;
  let rotationOffsetX = 0;
  
  switch (rotationOrigin) {
    case 'start':
    case 'tail': // Alias para 'start'
      rotationOffsetX = halfLength; // Rotar desde el inicio (cola) - línea va hacia adelante
      break;
    case 'end':
      rotationOffsetX = -halfLength; // Rotar desde el final (punta) - línea va hacia atrás
      break;
    case 'center':
    default:
      rotationOffsetX = 0; // Rotar desde el centro
      break;
  }
  
  // La transformación: trasladar al punto base, rotar, luego trasladar al punto de rotación
  const transformValue = `translate(${baseX}, ${baseY}) rotate(${currentAngle}) translate(${rotationOffsetX}, 0)`;

  switch (shape) {
    case 'line':
      return (
        <line
          {...vectorProps}
          transform={transformValue}
          x1={-halfLength + rotationOffsetX}
          y1={0}
          x2={halfLength + rotationOffsetX}
          y2={0}
        />
      );
    case 'arrow':
      // Path para una flecha simple
      // La punta de la flecha podría tener un tamaño relativo al ancho o longitud
      const arrowHeadSize = Math.max(5, width * 2);
      return (
        <g transform={transformValue}>
          <line
            stroke={vectorProps.stroke}
            strokeWidth={vectorProps.strokeWidth}
            strokeLinecap={vectorProps.strokeLinecap}
            x1={-halfLength + rotationOffsetX}
            y1={0}
            x2={halfLength - (arrowHeadSize / 2) + rotationOffsetX} // Acortar la línea principal para la cabeza
            y2={0}
          />
          <path
            d={`M ${halfLength - arrowHeadSize + rotationOffsetX},${-arrowHeadSize / 2} L ${halfLength + rotationOffsetX},0 L ${halfLength - arrowHeadSize + rotationOffsetX},${arrowHeadSize / 2}`}
            stroke={vectorProps.stroke}
            strokeWidth={vectorProps.strokeWidth}
            strokeLinejoin="round" // Para que la punta se vea bien
            fill={vectorProps.stroke} // Rellenar la punta de la flecha
          />
        </g>
      );
    case 'curve':
      // Una curva suave usando path quadrático
      const curveHeight = length * 0.3; // Altura de la curva más pronunciada
      const pathData = `M ${-halfLength + rotationOffsetX},0 Q ${rotationOffsetX},${-curveHeight} ${halfLength + rotationOffsetX},0`;
      return (
        <path
          {...vectorProps}
          transform={transformValue}
          d={pathData}
        />
      );
    case 'triangle':
      // Un triángulo isósceles apuntando a lo largo del eje x positivo
      // La base del triángulo estará en x = -halfLength
      // La punta estará en x = halfLength
      // La altura del triángulo (perpendicular al eje x) puede ser igual al ancho (width)
      return (
        <polygon
          {...vectorProps}
          transform={transformValue}
          points={`${halfLength + rotationOffsetX},0 ${-halfLength + rotationOffsetX},${-width / 2} ${-halfLength + rotationOffsetX},${width / 2}`}
          fill={vectorProps.stroke} // Los triángulos suelen estar rellenos
        />
      );
    case 'circle':
      // Un círculo centrado en el origen del vector (antes de la rotación)
      // El radio podría ser 'width' o una fracción de 'length'
      return (
        <circle
          {...vectorProps}
          transform={transformValue}
          cx={rotationOffsetX} // Círculo centrado en el punto de origen del vector (baseX, baseY)
          cy={0}
          r={width / 2} // Usar 'width' como diámetro del círculo
          fill={vectorProps.stroke} // Los círculos suelen estar rellenos
        />
      );
    case 'circle-wave':
      // Una curva circular suave usando path quadrático
      const circleWaveHeight = length * 0.3; // Altura de la curva
      const circleWavePathData = `M ${-halfLength + rotationOffsetX},0 Q ${rotationOffsetX},${-circleWaveHeight} ${halfLength + rotationOffsetX},0`;
      return (
        <path
          {...vectorProps}
          transform={transformValue}
          d={circleWavePathData}
        />
      );
    case 'dot':
      // Un punto circular simple - no se ve afectado por la rotación
      const dotRadius = Math.max(2, width / 2); // Radio mínimo de 2px
      return (
        <circle
          stroke={strokeColor}
          strokeWidth={1}
          fill={strokeColor}
          transform={`translate(${baseX}, ${baseY})`} // Sin rotación para puntos
          cx={0}
          cy={0}
          r={dotRadius}
        />
      );
    case 'custom':
      // Para 'custom', podrías tener una lógica más compleja o incluso
      // esperar un path SVG como parte de las props.
      // Por ahora, lo renderizamos como una línea simple.
      console.warn(`Vector shape "custom" not fully implemented. Rendering as line.`);
      return (
        <line
          {...vectorProps}
          transform={transformValue}
          x1={-halfLength + rotationOffsetX}
          y1={0}
          x2={halfLength + rotationOffsetX}
          y2={0}
        />
      );
    default:
      // Caso por defecto, renderizar una línea
      console.warn(`Unknown vector shape: "${shape}". Rendering as line.`);
      return (
        <line
          {...vectorProps}
          transform={transformValue}
          x1={-halfLength + rotationOffsetX}
          y1={0}
          x2={halfLength + rotationOffsetX}
          y2={0}
        />
      );
  }
});

RenderedVector.displayName = 'RenderedVector';
