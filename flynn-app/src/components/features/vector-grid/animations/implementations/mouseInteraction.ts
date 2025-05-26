import { AnimationImplementation, AnimatedVectorItem, AnimationParams } from '../types';

export type MouseEffectType = 'attract' | 'repel' | 'align';

/**
 * Animación "mouseInteraction" - Los vectores reaccionan a la posición del cursor
 */
export const mouseInteractionAnimation: AnimationImplementation = {
  id: 'mouseInteraction',
  name: 'Interacción con ratón',
  description: 'Los vectores reaccionan a la posición del cursor dentro de un radio de influencia',
  
  defaultProps: {
    interactionRadius: 150,     // Radio general de influencia
    attractionDistance: 50,     // Radio cercano de fuerte influencia
    repulsionDistance: 150,     // Radio de repulsión
    effectType: 'repel',        // Tipo de efecto: 'attract', 'repel', 'align'
    strength: 1.0,              // Intensidad del efecto
    alignAngleOffset: 0,        // Offset angular para los modos 'repel' o 'align'
    baseAngle: 0                // Ángulo base cuando no hay interacción
  },
  
  controls: [
    {
      id: 'interactionRadius',
      type: 'slider',
      label: 'Radio de interacción',
      min: 50,
      max: 300,
      step: 10,
      defaultValue: 150,
      tooltip: 'Radio de influencia alrededor del ratón'
    },
    {
      id: 'effectType',
      type: 'select',
      label: 'Tipo de efecto',
      options: [
        { value: 'attract', label: 'Atracción' },
        { value: 'repel', label: 'Repulsión' },
        { value: 'align', label: 'Alineación' }
      ],
      defaultValue: 'repel',
      tooltip: 'Cómo reaccionan los vectores ante el ratón'
    },
    {
      id: 'strength',
      type: 'slider',
      label: 'Intensidad',
      min: 0.1,
      max: 2.0,
      step: 0.1,
      defaultValue: 1.0,
      tooltip: 'Intensidad del efecto'
    },
    {
      id: 'baseAngle',
      type: 'slider',
      label: 'Ángulo base',
      min: 0,
      max: 360,
      step: 1,
      defaultValue: 0,
      tooltip: 'Ángulo predeterminado cuando no hay interacción con el ratón'
    }
  ],
  
  update: (
    vectors: AnimatedVectorItem[], 
    params: AnimationParams, 
    props: Record<string, unknown>
  ): AnimatedVectorItem[] => {
    const { mousePosition } = params;
    const interactionRadius = Number(props.interactionRadius) || 150;
    const attractionDistance = Number(props.attractionDistance) || 50;
    const repulsionDistance = Number(props.repulsionDistance) || 150;
    const effectType = (props.effectType as string) || 'repel';
    const strength = Number(props.strength) || 1.0;
    const alignAngleOffset = Number(props.alignAngleOffset) || 0;
    const baseAngle = Number(props.baseAngle) || 0;

    // Si no hay posición del ratón, mantenemos los ángulos base
    if (mousePosition.x === null || mousePosition.y === null) {
      return vectors.map(vector => ({
        ...vector,
        angle: baseAngle || vector.baseAngle,
        length: vector.baseLength,
        width: vector.baseWidth,
        opacity: vector.baseOpacity
      }));
    }
    
    return vectors.map(vector => {
      // Calcular distancia al cursor
      const dx = vector.baseX - (mousePosition.x ?? 0);
      const dy = vector.baseY - (mousePosition.y ?? 0);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Si está fuera del radio de interacción, mantener ángulo base
      if (distance > interactionRadius) {
        return {
          ...vector,
          angle: baseAngle !== undefined ? baseAngle : vector.baseAngle,
          length: vector.baseLength,
          width: vector.baseWidth,
          opacity: vector.baseOpacity
        };
      }
      
      // Calcular el ángulo desde el vector hacia el ratón (en grados)
      const angleToMouse = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Calcular la influencia basada en la distancia
      const influence = 1 - Math.min(1, Math.max(0, (distance - attractionDistance) / (repulsionDistance - attractionDistance)));
      const scaledInfluence = influence * strength;
      
      let targetAngle = vector.baseAngle;
      
      // Aplicar el efecto según el tipo
      switch (effectType) {
        case 'attract':
          // Apuntar hacia el ratón
          targetAngle = (angleToMouse + 180) % 360;
          break;
          
        case 'repel':
          // Apuntar alejándose del ratón
          targetAngle = angleToMouse;
          break;
          
        case 'align':
          // Alinearse con la dirección al ratón (perpendicular)
          targetAngle = (angleToMouse + alignAngleOffset) % 360;
          break;
      }
      
      // Calcular ángulo final como mezcla entre el base y el objetivo
      const finalAngle = vector.baseAngle + (targetAngle - vector.baseAngle) * scaledInfluence;
      
      return {
        ...vector,
        angle: finalAngle,
        // También podríamos modificar longitud, ancho u opacidad aquí
        length: vector.baseLength,
        width: vector.baseWidth,
        opacity: vector.baseOpacity
      };
    });
  }
};
