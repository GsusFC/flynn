// Animación "smoothWaves" - Ondas suaves
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle } from '../base/utils';

// Props para la animación smoothWaves
interface SmoothWavesProps {
    frequency: number;
    amplitude: number;
    speed: number;
    baseAngle: number;
    patternScale: number;
    waveType: 'circular' | 'linear' | 'diagonal';
    timeScale: number;
}

// Función de animación que crea ondas suaves
const animateSmoothWaves = (
    vectors: SimpleVector[],
    props: SmoothWavesProps,
    context: AnimationContext
): SimpleVector[] => {
    // Cache para valores del centro y constantes
    const centerX = context.canvasWidth * 0.5; // Usar multiplicación en vez de división
    const centerY = context.canvasHeight * 0.5;
    const scaledTime = context.time * props.speed * props.timeScale * 0.001;
    const patternScale = props.patternScale;
    const frequency = props.frequency;
    const amplitude = props.amplitude;
    const baseAngle = props.baseAngle;

    // Pre-calcular valor para ondas circulares (evitar recálculo del Math.sqrt cuando sea posible)
    const isCircular = props.waveType === 'circular';
    const isLinear = props.waveType === 'linear';

    return vectors.map(vector => {
        let waveOffset: number;

        // Calcular el offset de onda según el tipo optimizado
        if (isCircular) {
            // Ondas circulares - calcular distancia con cache de diferencias
            const dx = vector.originalX - centerX;
            const dy = vector.originalY - centerY;
            const distanceSquared = dx * dx + dy * dy;
            // Usar Math.sqrt solo cuando sea necesario - no se puede evitar aquí
            waveOffset = Math.sqrt(distanceSquared) * patternScale;
        } else if (isLinear) {
            // Ondas lineales - más eficiente
            waveOffset = vector.originalY * patternScale;
        } else {
            // Ondas diagonales - evitar suma repetida
            waveOffset = (vector.originalX + vector.originalY) * patternScale;
        }

        // Calcular el ángulo usando constantes pre-calculadas
        const waveAngle = baseAngle + Math.sin(scaledTime + waveOffset * frequency) * amplitude;

        return {
            ...vector,
            angle: normalizeAngle(waveAngle)
        };
    });
};

// Validación de props
const validateSmoothWavesProps = (props: SmoothWavesProps): boolean => {
    if (typeof props.frequency !== 'number' || isNaN(props.frequency) || props.frequency <= 0) {
        console.warn('[smoothWaves] La frecuencia debe ser un número positivo');
        return false;
    }
    if (typeof props.amplitude !== 'number' || isNaN(props.amplitude) || props.amplitude < 0) {
        console.warn('[smoothWaves] La amplitud debe ser un número no negativo');
        return false;
    }
    if (typeof props.speed !== 'number' || isNaN(props.speed) || props.speed <= 0) {
        console.warn('[smoothWaves] La velocidad debe ser un número positivo');
        return false;
    }
    if (typeof props.baseAngle !== 'number' || isNaN(props.baseAngle)) {
        console.warn('[smoothWaves] El ángulo base debe ser un número');
        return false;
    }
    if (typeof props.patternScale !== 'number' || isNaN(props.patternScale) || props.patternScale <= 0) {
        console.warn('[smoothWaves] La escala del patrón debe ser un número positivo');
        return false;
    }
    if (!['circular', 'linear', 'diagonal'].includes(props.waveType)) {
        console.warn('[smoothWaves] El tipo de onda debe ser circular, linear o diagonal');
        return false;
    }
    if (typeof props.timeScale !== 'number' || isNaN(props.timeScale) || props.timeScale <= 0) {
        console.warn('[smoothWaves] La escala de tiempo debe ser un número positivo');
        return false;
    }
    return true;
};

// Exportar la animación smoothWaves
export const smoothWavesAnimation = createSimpleAnimation<SmoothWavesProps>({
    id: 'smoothWaves',
    name: 'Ondas suaves',
    description: 'Ondas fluidas que se propagan a través de la cuadrícula',
    category: 'waves',
    icon: '🌊',
    controls: [
        {
            id: 'frequency',
            label: 'Frecuencia',
            type: 'slider',
            min: 0.01,
            max: 0.5,
            step: 0.01,
            defaultValue: 0.1,
            description: 'Frecuencia de las ondas (0.01-0.5)',
            icon: '📡'
        },
        {
            id: 'amplitude',
            label: 'Amplitud',
            type: 'slider',
            min: 5,
            max: 90,
            step: 1,
            defaultValue: 30,
            description: 'Amplitud de la oscilación en grados',
            icon: '📊'
        },
        {
            id: 'speed',
            label: 'Velocidad',
            type: 'slider',
            min: 0.1,
            max: 2.0,
            step: 0.1,
            defaultValue: 0.5,
            description: 'Velocidad de movimiento de las ondas',
            icon: '⚡'
        },
        {
            id: 'baseAngle',
            label: 'Ángulo base',
            type: 'slider',
            min: 0,
            max: 360,
            step: 1,
            defaultValue: 0,
            description: 'Ángulo base sobre el que oscilan las ondas',
            icon: '🧭'
        },
        {
            id: 'patternScale',
            label: 'Escala espacial',
            type: 'slider',
            min: 0.001,
            max: 0.05,
            step: 0.001,
            defaultValue: 0.01,
            description: 'Escala del patrón espacial (valores más altos = ondas más juntas)',
            icon: '🔍'
        },
        {
            id: 'waveType',
            label: 'Tipo de onda',
            type: 'select',
            options: [
                { value: 'circular', label: 'Circular' },
                { value: 'linear', label: 'Lineal' },
                { value: 'diagonal', label: 'Diagonal' }
            ],
            defaultValue: 'circular',
            description: 'Patrón de propagación de las ondas',
            icon: '🌀'
        },
        {
            id: 'timeScale',
            label: 'Escala temporal',
            type: 'slider',
            min: 0.1,
            max: 3.0,
            step: 0.1,
            defaultValue: 1.0,
            description: 'Escala temporal adicional (1.0 = normal)',
            icon: '⏱️'
        }
    ],
    defaultProps: {
        frequency: 0.1,
        amplitude: 30,
        speed: 0.5,
        baseAngle: 0,
        patternScale: 0.01,
        waveType: 'circular' as const,
        timeScale: 1.0
    },
    animate: animateSmoothWaves,
    validateProps: validateSmoothWavesProps
});
