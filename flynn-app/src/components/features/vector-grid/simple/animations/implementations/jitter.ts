// Animación "jitter" - Vibración Aleatoria
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';
import { normalizeAngle } from '../base/utils';

// Props para la animación jitter
interface JitterProps {
    intensity: number;
    frequency: number;
    baseAnimation: 'smoothWaves' | 'static' | 'none';
}

// Función de animación que añade vibración aleatoria
const animateJitter = (
    vectors: SimpleVector[],
    props: JitterProps,
    context: AnimationContext
): SimpleVector[] => {
    const { intensity, frequency, baseAnimation } = props;

    // Pre-calcular constantes
    const timeFactor = context.time * 0.001;
    const timeHalf = timeFactor * 0.5;
    const timeFrequency = timeFactor * frequency;
    const intensityMod1 = intensity * 0.7;
    const intensityMod2 = intensity * 0.5;

    // Constantes espaciales pre-calculadas
    const spatialX = 0.01;
    const spatialY = 0.01;
    const seedX = 0.1234;
    const seedY = 0.5678;
    const golden1 = 1.618;
    const golden2 = 0.618;
    const silver1 = 2.414;
    const silver2 = 1.414;

    return vectors.map(vector => {
        let baseAngle = vector.originalAngle;

        // Calcular ángulo base según el tipo de animación base
        switch (baseAnimation) {
            case 'smoothWaves':
                // Ondas suaves como base - evitar conversión radianes→grados
                const waveX = Math.sin(vector.originalX * spatialX + timeHalf);
                const waveY = Math.cos(vector.originalY * spatialY + timeHalf);
                const waveAngle = Math.atan2(waveY, waveX); // Mantener en radianes
                baseAngle = vector.originalAngle + waveAngle * 1718.87; // 30 * (180/π) precalculado
                break;

            case 'static':
                baseAngle = vector.originalAngle;
                break;

            case 'none':
                baseAngle = 0;
                break;
        }

        // Pre-calcular seeds
        const seed1 = vector.originalX * seedX + vector.originalY * seedY;
        const seed2 = timeFrequency;

        // Calcular jitter con constantes pre-calculadas
        const jitter1 = Math.sin(seed1 + seed2) * intensity;
        const jitter2 = Math.cos(seed1 * golden1 + seed2 * golden2) * intensityMod1;
        const jitter3 = Math.sin(seed1 * silver1 + seed2 * silver2) * intensityMod2;

        const totalJitter = jitter1 + jitter2 + jitter3;
        const finalAngle = baseAngle + totalJitter;

        return {
            ...vector,
            angle: normalizeAngle(finalAngle)
        };
    });
};

// Validación de props
const validateJitterProps = (props: JitterProps): boolean => {
    if (typeof props.intensity !== 'number' || isNaN(props.intensity) || props.intensity < 0) {
        console.warn('[jitter] La intensidad debe ser un número positivo');
        return false;
    }
    if (typeof props.frequency !== 'number' || isNaN(props.frequency) || props.frequency <= 0) {
        console.warn('[jitter] La frecuencia debe ser un número positivo');
        return false;
    }
    if (!['smoothWaves', 'static', 'none'].includes(props.baseAnimation)) {
        console.warn('[jitter] La animación base debe ser smoothWaves, static o none');
        return false;
    }
    return true;
};

// Exportar la animación jitter
export const jitterAnimation = createSimpleAnimation<JitterProps>({
    id: 'jitter',
    name: 'Vibración Aleatoria',
    description: 'Añade vibración aleatoria controlada a los vectores',
    category: 'advanced',
    icon: '🎲',
    controls: [
        {
            id: 'intensity',
            label: 'Intensidad',
            type: 'slider',
            min: 0,
            max: 90,
            step: 1,
            defaultValue: 15,
            description: 'Intensidad de la vibración en grados (0-90)',
            icon: '💪'
        },
        {
            id: 'frequency',
            label: 'Frecuencia',
            type: 'slider',
            min: 0.1,
            max: 10.0,
            step: 0.1,
            defaultValue: 3.0,
            description: 'Frecuencia de la vibración (0.1-10.0)',
            icon: '📡'
        },
        {
            id: 'baseAnimation',
            label: 'Animación Base',
            type: 'select',
            options: [
                { value: 'smoothWaves', label: 'Ondas Suaves' },
                { value: 'static', label: 'Estático' },
                { value: 'none', label: 'Solo Vibración' }
            ],
            defaultValue: 'smoothWaves',
            description: 'Animación base sobre la que aplicar la vibración',
            icon: '🎭'
        }
    ],
    defaultProps: {
        intensity: 15,
        frequency: 3.0,
        baseAnimation: 'smoothWaves'
    },
    animate: animateJitter,
    validateProps: validateJitterProps
});
