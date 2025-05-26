// Animación "pinwheels" - Molinos (OPTIMIZADA)
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle } from '../base/utils';

// Props para la animación pinwheels
interface PinwheelsProps {
    pinwheelCount: number;
    rotationSpeed: number;
    moveSpeed: number;
    influenceRadius: number;
}

// Cache para constantes pre-calculadas
let cachedPinwheelData: {
    centerX: number;
    centerY: number;
    radius: number;
    baseAngles: number[];
    canvasKey: string;
} | null = null;

// Constantes pre-calculadas
const PI = Math.PI;
const PI_2 = PI / 2;
const DEG_TO_RAD = PI / 180;
const RAD_TO_DEG = 180 / PI;
const TWO_PI = PI * 2;
const WAVE_FACTOR = 0.005;
const MOVE_SPEED_FACTOR = 0.3;
const ROTATION_SPEED_FACTOR = 0.5;
const BLEND_INTENSITY = 0.7;
const WAVE_INTENSITY = 10;
const WAVE_TIME_FACTOR = 0.3;

// Función de animación ULTRA-OPTIMIZADA para mejor rendimiento
const animatePinwheels = (
    vectors: SimpleVector[],
    props: PinwheelsProps,
    context: AnimationContext
): SimpleVector[] => {
    const { pinwheelCount, rotationSpeed, moveSpeed, influenceRadius } = props;
    const timeFactor = context.time * 0.001;

    // Limitar número de molinos para rendimiento
    const safeCount = Math.min(pinwheelCount, 4);

    // Cache de datos del canvas y molinos
    const canvasKey = `${context.canvasWidth}x${context.canvasHeight}x${safeCount}`;
    if (!cachedPinwheelData || cachedPinwheelData.canvasKey !== canvasKey) {
        const centerX = context.canvasWidth * 0.5;
        const centerY = context.canvasHeight * 0.5;
        const radius = Math.min(context.canvasWidth, context.canvasHeight) * 0.25;

        // Pre-calcular ángulos base de molinos
        const baseAngles: number[] = [];
        const angleStep = TWO_PI / safeCount;
        for (let i = 0; i < safeCount; i++) {
            baseAngles[i] = i * angleStep;
        }

        cachedPinwheelData = {
            centerX,
            centerY,
            radius,
            baseAngles,
            canvasKey
        };
    }

    const { centerX, centerY, radius, baseAngles } = cachedPinwheelData;

    // Pre-calcular valores temporales que se reutilizan
    const moveOffset = timeFactor * moveSpeed * MOVE_SPEED_FACTOR;
    const rotationOffset = timeFactor * rotationSpeed * ROTATION_SPEED_FACTOR;
    const waveTime = timeFactor * WAVE_TIME_FACTOR;

    // Pre-calcular posiciones de molinos
    const molPositions: Array<{ x: number; y: number; cosAngle: number; sinAngle: number }> = [];
    for (let i = 0; i < safeCount; i++) {
        const baseAngle = baseAngles[i];
        const totalAngle = baseAngle + moveOffset;
        const cosAngle = Math.cos(totalAngle);
        const sinAngle = Math.sin(totalAngle);

        molPositions[i] = {
            x: centerX + cosAngle * radius,
            y: centerY + sinAngle * radius,
            cosAngle,
            sinAngle
        };
    }

    return vectors.map(vector => {
        let maxInfluence = 0;
        let bestBlendedX = 0;
        let bestBlendedY = 0;

        // Verificar influencia de cada molino
        for (let i = 0; i < safeCount; i++) {
            const mol = molPositions[i];

            // Calcular distancia al molino
            const dx = vector.originalX - mol.x;
            const dy = vector.originalY - mol.y;
            const distanceSquared = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSquared);

            if (distance < influenceRadius) {
                // Calcular ángulo hacia el centro del molino
                const angleToCenter = Math.atan2(dy, dx);

                // Ángulo tangencial y rotación
                const rotatedAngle = angleToCenter + PI_2 + rotationOffset;

                // Calcular influencia basada en la distancia (suavizada)
                const influence = Math.max(0, 1 - (distance / influenceRadius));
                const smoothInfluence = influence * influence;

                if (smoothInfluence > maxInfluence) {
                    maxInfluence = smoothInfluence;

                    // Pre-calcular valores para mezcla
                    const originalAngleRad = vector.originalAngle * DEG_TO_RAD;
                    const blendFactor = smoothInfluence * BLEND_INTENSITY;
                    const oneMinusBlend = 1 - blendFactor;

                    const cosOriginal = Math.cos(originalAngleRad);
                    const sinOriginal = Math.sin(originalAngleRad);
                    const cosRotated = Math.cos(rotatedAngle);
                    const sinRotated = Math.sin(rotatedAngle);

                    bestBlendedX = cosOriginal * oneMinusBlend + cosRotated * blendFactor;
                    bestBlendedY = sinOriginal * oneMinusBlend + sinRotated * blendFactor;
                }
            }
        }

        let finalAngle: number;

        if (maxInfluence > 0) {
            // Usar la mejor mezcla calculada
            finalAngle = Math.atan2(bestBlendedY, bestBlendedX) * RAD_TO_DEG;
        } else {
            // Ondas suaves como fallback
            const wavePhaseX = vector.originalX * WAVE_FACTOR + waveTime;
            const wavePhaseY = vector.originalY * WAVE_FACTOR + waveTime;
            const waveX = Math.sin(wavePhaseX);
            const waveY = Math.cos(wavePhaseY);
            const waveAngle = Math.atan2(waveY, waveX) * RAD_TO_DEG;
            finalAngle = vector.originalAngle + waveAngle * WAVE_INTENSITY;
        }

        return {
            ...vector,
            angle: normalizeAngle(finalAngle)
        };
    });
};

// Validación de props
const validatePinwheelsProps = (props: PinwheelsProps): boolean => {
    if (typeof props.pinwheelCount !== 'number' || isNaN(props.pinwheelCount) ||
        props.pinwheelCount < 1 || props.pinwheelCount > 4) { // Reducir máximo
        console.warn('[pinwheels] El número de molinos debe ser entre 1 y 4');
        return false;
    }
    if (typeof props.rotationSpeed !== 'number' || isNaN(props.rotationSpeed)) {
        console.warn('[pinwheels] La velocidad de rotación debe ser un número');
        return false;
    }
    if (typeof props.moveSpeed !== 'number' || isNaN(props.moveSpeed) || props.moveSpeed < 0) {
        console.warn('[pinwheels] La velocidad de movimiento debe ser un número positivo');
        return false;
    }
    if (typeof props.influenceRadius !== 'number' || isNaN(props.influenceRadius) || props.influenceRadius <= 0) {
        console.warn('[pinwheels] El radio de influencia debe ser un número positivo');
        return false;
    }
    return true;
};

// Exportar la animación pinwheels
export const pinwheelsAnimation = createSimpleAnimation<PinwheelsProps>({
    id: 'pinwheels',
    name: 'Molinos',
    description: 'Molinos giratorios que se mueven por el canvas (optimizado)',
    category: 'advanced',
    icon: '🎯',
    controls: [
        {
            id: 'pinwheelCount',
            label: 'Número Molinos',
            type: 'slider',
            min: 1,
            max: 4, // Reducir máximo para rendimiento
            step: 1,
            defaultValue: 2,
            description: 'Número de molinos (1-4)',
            icon: '🔢'
        },
        {
            id: 'rotationSpeed',
            label: 'Velocidad Rotación',
            type: 'slider',
            min: 0.5,
            max: 3.0, // Reducir máximo
            step: 0.1,
            defaultValue: 1.5,
            description: 'Velocidad de rotación de los molinos (0.5-3.0)',
            icon: '🔄'
        },
        {
            id: 'moveSpeed',
            label: 'Velocidad Movimiento',
            type: 'slider',
            min: 0.0,
            max: 2.0, // Reducir máximo
            step: 0.1,
            defaultValue: 0.8,
            description: 'Velocidad de movimiento de los molinos (0.0-2.0)',
            icon: '🚀'
        },
        {
            id: 'influenceRadius',
            label: 'Radio Influencia',
            type: 'slider',
            min: 50,
            max: 200, // Reducir máximo
            step: 10,
            defaultValue: 120,
            description: 'Radio de influencia de cada molino (50-200)',
            icon: '📡'
        }
    ],
    defaultProps: {
        pinwheelCount: 2,
        rotationSpeed: 1.5,
        moveSpeed: 0.8,
        influenceRadius: 120
    },
    animate: animatePinwheels,
    validateProps: validatePinwheelsProps
});
