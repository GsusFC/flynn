# Funcionalidades Avanzadas y Consideraciones

## (...) <!-- Otras secciones como SVG de Usuario, Exportación GIF, etc. -->

## 2. Tipos de Animación (`animationType`) y Propiedades (`animationProps`)

El hook `useVectorAnimation` soporta diferentes algoritmos de animación, seleccionables mediante la prop `animationType` y configurables a través de `animationProps`. A continuación, se detallan los tipos de animación planificados o implementados conceptualmente:

---

1.  **`none`**
    *   **Descripción:** Sin animación activa. Los vectores mantienen su `initialAngle` (el ángulo asignado durante la generación de la cuadrícula).
    *   **`animationProps` Esperadas:** `{}` (Ninguna).

2.  **`staticAngle`**
    *   **Descripción:** Todos los vectores se orientan y mantienen un ángulo fijo especificado.
    *   **`animationProps` Esperadas:**
        *   `angle: number` (Obligatorio): El ángulo en grados (0-360) al que apuntarán todos los vectores.

3.  **`randomLoop`**
    *   **Descripción:** Cada vector selecciona un nuevo ángulo objetivo aleatorio a intervalos regulares, transicionando suavemente hacia él.
    *   **`animationProps` Esperadas:**
        *   `intervalMs?: number` (Default: `2000`): Milisegundos entre cada cambio de ángulo objetivo.
        *   `transitionSpeedFactor?: number` (Default: `1.0`): Multiplicador para el `easingFactor` global durante la transición a un nuevo ángulo aleatorio (un valor mayor acelera la transición).

4.  **`smoothWaves`**
    *   **Descripción:** Genera un patrón de ondas suaves y fluidas que se propagan a través de la cuadrícula.
    *   **`animationProps` Esperadas (Ejemplos de Default):**
        *   `waveFrequency?: number` (Default: `0.0002`): Frecuencia temporal de la onda (valores más bajos = ondas más lentas).
        *   `waveAmplitude?: number` (Default: `30`): Amplitud angular de la oscilación (en grados).
        *   `baseAngle?: number` (Default: `0`): Ángulo base sobre el cual oscila la onda.
        *   `patternScale?: number` (Default: `0.01`): Factor de escala espacial para la onda (cómo se espacia el patrón en la cuadrícula).
        *   `waveType?: 'circular' | 'linear' | 'diagonal'` (Default: `'circular'`): Tipo de patrón de onda.
            *   `'circular'`: Ondas que se expanden desde un centro (usa distancia Manhattan aprox.).
            *   `'linear'`: Ondas que se mueven principalmente en una dirección.
            *   `'diagonal'`: Ondas que se mueven en diagonal.
        *   `centerX?: number`, `centerY?: number`: Coordenadas opcionales para el centro del patrón de onda (si no se proveen, se usa una estimación).
        *   `timeScale?: number` (Default: `1.0`): Multiplicador de tiempo específico para este efecto de animación.

5.  **`seaWaves` (Conceptual)**
    *   **Descripción:** Simulación más orgánica de olas, combinando múltiples funciones sinusoidales para crear un movimiento menos predecible.
    *   **`animationProps` Esperadas (Ejemplos de Default):**
        *   `baseFrequency?: number` (Default: `0.001`)
        *   `baseAmplitude?: number` (Default: `30`)
        *   `rippleFrequency?: number` (Default: `0.002`)
        *   `rippleAmplitude?: number` (Default: `15`)
        *   `choppiness?: number` (Default: `0.5`, Rango 0-1): Factor para añadir "ruido" o variaciones más agudas.
        *   `spatialFactor?: number` (Default: `0.01`): Cómo la posición afecta la onda.

6.  **`perlinFlow` (Conceptual - Requiere librería de ruido)**
    *   **Descripción:** Movimiento fluido y orgánico donde los ángulos de los vectores son determinados por un campo de ruido Perlin o Simplex que evoluciona en el tiempo.
    *   **`animationProps` Esperadas (Ejemplos de Default):**
        *   `noiseScale?: number` (Default: `0.02`): Escala del campo de ruido (valores más pequeños = patrones más grandes y suaves).
        *   `timeEvolutionSpeed?: number` (Default: `0.0005`): Qué tan rápido cambia el campo de ruido en la dimensión temporal.
        *   `angleMultiplier?: number` (Default: `360`): Multiplicador para mapear el valor del ruido (usualmente -1 a 1) al rango angular deseado (0-360).

7.  **`mouseInteraction`**
    *   **Descripción:** Los vectores reaccionan a la posición del cursor del ratón dentro de un radio de influencia.
    *   **`animationProps` Esperadas (Ejemplos de Default):**
        *   `interactionRadius?: number` (Default: `150`): Radio general de influencia alrededor del ratón.
        *   `attractionDistance?: number` (Default: `50`): Radio más cercano donde los vectores son fuertemente atraídos/alineados con el cursor.
        *   `repulsionDistance?: number` (Default: `150`): Radio donde los vectores son repelidos. (Podría ser igual a `interactionRadius`).
        *   `effectType?: 'attract' | 'repel' | 'align'` (Default: `'repel'`):
            *   `'attract'`: Apuntan hacia el ratón.
            *   `'repel'`: Apuntan lejos del ratón.
            *   `'align'`: Se alinean con la dirección desde el vector hacia el ratón (o viceversa).
        *   `strength?: number` (Default: `1.0`): Factor de intensidad o rapidez de la reacción.
        *   `alignAngleOffset?: number` (Default: `0`): Desfase angular para los modos `repel` o `align`.

8.  **`centerPulse`**
    *   **Descripción:** Genera una onda que se propaga desde el centro del canvas (o un punto definido), afectando ángulo, longitud, grosor e intensidad de los vectores. Se activa mediante la prop `pulseTrigger`.
    *   **`animationProps` Esperadas:** Un sub-objeto `pulse` con las siguientes propiedades (ver `applyPulseToVector` para detalles):
        *   `pulseDuration?: number` (Default: `1000ms`)
        *   `maxAngleOffset?: number` (Default: `90`)
        *   `angleOffsetMode?: 'sine' | 'triangle' | 'random'`
        *   `targetAngleDuringPulse?: 'initialRelative' | 'currentRelative' | 'awayFromCenter' | 'towardsCenter' | 'perpendicularClockwise' | 'perpendicularCounterClockwise'`
        *   `maxLengthFactorPulse?: number` (Default: `1.5`)
        *   `minLengthFactorPulse?: number` (Default: `0.8`)
        *   `maxWidthFactorPulse?: number` (Default: `1.2`)
        *   `minWidthFactorPulse?: number` (Default: `0.9`)
        *   `maxIntensityFactorPulse?: number` (Default: `1.0`)
        *   `minIntensityFactorPulse?: number` (Default: `0.5`)
        *   `distanceImpactFactor?: number` (Default: `0.3`): Cómo la distancia al centro afecta la intensidad/timing.
        *   `delayPerDistanceUnit?: number` (Default: `0`): Retraso basado en distancia normalizada.
        *   `easingFnKey?: string` (Default: `'easeInOutQuad'`): Clave de la función de easing para la progresión del pulso.
        *   `angleEasingFnKey?: string` (Default: `'easeOutQuad'`)
        *   `factorEasingFnKey?: string` (Default: `'easeOutElastic'`)
        *   `onPulseComplete?: (vectorId: string) => void`: (Este se pasa desde `VectorGridProps` al hook).
        *   `onAllPulsesComplete?: () => void`: (Este se pasa desde `VectorGridProps` al hook).

9.  **`directionalFlow`**
    *   **Descripción:** Los vectores se alinean predominantemente en una dirección especificada, con una posible turbulencia.
    *   **`animationProps` Esperadas (Ejemplos de Default):**
        *   `flowAngle?: number` (Default: `0`): Ángulo principal del flujo (0-360).
        *   `turbulence?: number` (Default: `0.2`, Rango 0-1): Magnitud de la variación aleatoria del ángulo.

10. **`tangenteClasica`**
    *   **Descripción:** Los vectores rotan tangencialmente alrededor del centro del canvas.
    *   **`animationProps` Esperadas (Ejemplos de Default):**
        *   `rotationSpeed?: number` (Default: `0.0003`): Velocidad de la rotación tangencial (valores más pequeños = más lento).
        *   `direction?: 'clockwise' | 'counterClockwise'` (Default: `'clockwise'`): Dirección de la rotación.

11. **`lissajous` (Conceptual)**
    *   **Descripción:** Los ángulos de los vectores se derivan de los componentes de una curva de Lissajous.
    *   **`animationProps` Esperadas (Ejemplos de Default):**
        *   `xFrequency?: number` (Default: `2`)
        *   `yFrequency?: number` (Default: `3`)
        *   `xAmplitude?: number` (Default: `90`)
        *   `yAmplitude?: number` (Default: `90`)
        *   `phaseOffset?: number` (Default: `Math.PI / 2`)
        *   `timeSpeed?: number` (Default: `0.001`)

12. **`vortex` (Conceptual)**
    *   **Descripción:** Los vectores giran alrededor de un punto central (el centro del canvas por defecto, o la posición del ratón si `useMouseAsCenter` es true).
    *   **`animationProps` Esperadas (Ejemplos de Default):**
        *   `vortexCenterX?: number`, `vortexCenterY?: number`: Coordenadas del centro del vórtice. Si no se proveen, se usa el centro del canvas.
        *   `useMouseAsCenter?: boolean` (Default: `false`): Si es true, el vórtice sigue al ratón (anula `vortexCenterX/Y`).
        *   `strength?: number` (Default: `0.05`): Influencia o velocidad de la rotación.
        *   `radiusFalloff?: number` (Default: `1.0`, Rango ej. 0.5-2.0): Cómo disminuye la fuerza del vórtice con la distancia (1 = lineal, >1 = más rápido, <1 = más lento).
        *   `swirlDirection?: 'clockwise' | 'counterClockwise'` (Default: `'clockwise'`)

---
*(Se podrían añadir más tipos de animación como `flocking`, `audioReactive`, `followPath` en futuras iteraciones, ya que son más complejos de implementar).*

Este listado debería servir como una buena guía para la implementación y para la UI del panel de control, donde se mostrarían las `animationProps` relevantes cuando un `animationType` es seleccionado.