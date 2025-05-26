// Animación "vortex" - Vórtice/Remolino (OPTIMIZADA)
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle } from '../base/utils';

// Props para la animación vortex
interface VortexProps {
    intensity: number;
    rotationSpeed: number;
    inwardPull: number;
    centerX?: number;
    centerY?: number;
}

// Cache para maxDistance (calculado una vez por canvas size)
let cachedMaxDistance = 0;
let cachedCanvasKey = '';

// Constantes pre-calculadas
const PI = Math.PI;
const PI_2 = PI / 2;
const DEG_TO_RAD = PI / 180;
const RAD_TO_DEG = 180 / PI;
const TIME_FACTOR = 0.001;

// Función de animación ULTRA-OPTIMIZADA para mejor rendimiento
const animateVortex = (
    vectors: SimpleVector[],
    props: VortexProps,
    context: AnimationContext
): SimpleVector[] => {
    // Optimización: salir temprano si no hay intensidad
    if (props.intensity <= 0) {
        return vectors;
    }

    // Usar centro personalizado o centro del canvas
    const centerX = props.centerX ?? context.canvasWidth * 0.5;
    const centerY = props.centerY ?? context.canvasHeight * 0.5;

    // Cache para maxDistance
    const canvasKey = `${context.canvasWidth}x${context.canvasHeight}`;
    if (canvasKey !== cachedCanvasKey) {
        cachedMaxDistance = Math.max(context.canvasWidth, context.canvasHeight) * 0.5;
        cachedCanvasKey = canvasKey;
    }

    // Pre-calcular valores que no cambian por vector
    const timeFactor = context.time * TIME_FACTOR;
    const rotationOffset = timeFactor * props.rotationSpeed;
    const inwardWeight = props.inwardPull;
    const tangentialWeight = 1 - inwardWeight;

    return vectors.map(vector => {
        // Calcular posición relativa al centro del vórtice
        const dx = vector.originalX - centerX;
        const dy = vector.originalY - centerY;
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared);

        // Optimización: salir temprano si está muy lejos
        if (distance > cachedMaxDistance) {
            return vector;
        }

        const angleToCenter = Math.atan2(dy, dx);

        // Calcular ángulo tangencial y aplicar rotación
        const vortexAngle = angleToCenter + PI_2 + rotationOffset;

        // Ángulo hacia el centro (atracción interna)
        const inwardAngle = angleToCenter + PI;

        // Pre-calcular valores trigonométricos
        const cosTangential = Math.cos(vortexAngle);
        const sinTangential = Math.sin(vortexAngle);
        const cosInward = Math.cos(inwardAngle);
        const sinInward = Math.sin(inwardAngle);

        // Combinar los ángulos usando vectores (pre-optimizado)
        const combinedX = cosTangential * tangentialWeight + cosInward * inwardWeight;
        const combinedY = sinTangential * tangentialWeight + sinInward * inwardWeight;
        const combinedAngle = Math.atan2(combinedY, combinedX);

        // Aplicar intensidad basada en la distancia (más fuerte cerca del centro)
        const distanceFactor = Math.max(0, 1 - (distance / cachedMaxDistance));
        const effectStrength = distanceFactor * props.intensity;

        // Optimización: salir temprano si no hay efecto
        if (effectStrength <= 0) {
            return vector;
        }

        // Pre-calcular valores para mezcla final
        const originalAngleRad = vector.originalAngle * DEG_TO_RAD;
        const oneMinusEffect = 1 - effectStrength;

        const cosOriginal = Math.cos(originalAngleRad);
        const sinOriginal = Math.sin(originalAngleRad);
        const cosCombined = Math.cos(combinedAngle);
        const sinCombined = Math.sin(combinedAngle);

        // Mezclar con el ángulo original
        const blendedX = cosOriginal * oneMinusEffect + cosCombined * effectStrength;
        const blendedY = sinOriginal * oneMinusEffect + sinCombined * effectStrength;

        const finalAngle = Math.atan2(blendedY, blendedX) * RAD_TO_DEG;

        return {
            ...vector,
            angle: normalizeAngle(finalAngle)
        };
    });
};

// Validación de props
const validateVortexProps = (props: VortexProps): boolean => {
    if (typeof props.intensity !== 'number' || isNaN(props.intensity) ||
        props.intensity < 0 || props.intensity > 1) {
        console.warn('[vortex] La intensidad debe ser un número entre 0 y 1');
        return false;
    }
    if (typeof props.rotationSpeed !== 'number' || isNaN(props.rotationSpeed)) {
        console.warn('[vortex] La velocidad de rotación debe ser un número');
        return false;
    }
    if (typeof props.inwardPull !== 'number' || isNaN(props.inwardPull) ||
        props.inwardPull < 0 || props.inwardPull > 1) {
        console.warn('[vortex] La atracción hacia el centro debe ser un número entre 0 y 1');
        return false;
    }
    return true;
};

// Exportar la animación vortex
export const vortexAnimation = createSimpleAnimation<VortexProps>({
    id: 'vortex',
    name: 'Vórtice',
    description: 'Crea un efecto de remolino con atracción hacia el centro (optimizado)',
    category: 'advanced',
    icon: '🌪️',
    controls: [
        {
            id: 'intensity',
            label: 'Intensidad',
            type: 'slider',
            min: 0.0,
            max: 1.0,
            step: 0.1,
            defaultValue: 0.7,
            description: 'Intensidad del efecto vórtice (0.0-1.0)',
            icon: '💪'
        },
        {
            id: 'rotationSpeed',
            label: 'Velocidad Rotación',
            type: 'slider',
            min: 0.1,
            max: 3.0,
            step: 0.1,
            defaultValue: 1.0,
            description: 'Velocidad de rotación del vórtice (0.1-3.0)',
            icon: '🔄'
        },
        {
            id: 'inwardPull',
            label: 'Atracción Centro',
            type: 'slider',
            min: 0.0,
            max: 1.0,
            step: 0.1,
            defaultValue: 0.3,
            description: 'Fuerza de atracción hacia el centro (0.0-1.0)',
            icon: '🎯'
        }
    ],
    defaultProps: {
        intensity: 0.7,
        rotationSpeed: 1.0,
        inwardPull: 0.3
    },
    animate: animateVortex,
    validateProps: validateVortexProps
});
