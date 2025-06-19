# Advanced Features and Considerations

## (...) <!-- Other sections like User SVG, GIF Export, etc. -->

## 2. Animation Types (`animationType`) and Properties (`animationProps`)

The `useVectorAnimation` hook supports different animation algorithms, selectable via the `animationType` prop and configurable through `animationProps`. Below are the planned or conceptually implemented animation types:

---

1.  **`none`**
    *   **Description:** No active animation. Vectors maintain their `initialAngle` (the angle assigned during grid generation).
    *   **Expected `animationProps`:** `{}` (None).

2.  **`staticAngle`**
    *   **Description:** All vectors orient and maintain a specified fixed angle.
    *   **Expected `animationProps`:**
        *   `angle: number` (Required): The angle in degrees (0-360) that all vectors will point to.

3.  **`randomLoop`**
    *   **Description:** Each vector selects a new random target angle at regular intervals, smoothly transitioning to it.
    *   **Expected `animationProps`:**
        *   `intervalMs?: number` (Default: `2000`): Milliseconds between each target angle change.
        *   `transitionSpeedFactor?: number` (Default: `1.0`): Multiplier for the global `easingFactor` during transition to a new random angle (higher value speeds up transition).

4.  **`smoothWaves`**
    *   **Description:** Generates smooth and fluid wave patterns that propagate through the grid.
    *   **Expected `animationProps` (Default Examples):**
        *   `waveFrequency?: number` (Default: `0.0002`): Temporal frequency of the wave (lower values = slower waves).
        *   `waveAmplitude?: number` (Default: `30`): Angular amplitude of oscillation (in degrees).
        *   `baseAngle?: number` (Default: `0`): Base angle over which the wave oscillates.
        *   `patternScale?: number` (Default: `0.01`): Spatial scale factor for the wave (how the pattern is spaced in the grid).
        *   `waveType?: 'circular' | 'linear' | 'diagonal'` (Default: `'circular'`): Type of wave pattern.
            *   `'circular'`: Waves that expand from a center (uses approximate Manhattan distance).
            *   `'linear'`: Waves that move primarily in one direction.
            *   `'diagonal'`: Waves that move diagonally.
        *   `centerX?: number`, `centerY?: number`: Optional coordinates for the wave pattern center (if not provided, an estimation is used).
        *   `timeScale?: number` (Default: `1.0`): Time multiplier specific to this animation effect.

5.  **`seaWaves` (Conceptual)**
    *   **Description:** More organic wave simulation, combining multiple sinusoidal functions to create less predictable movement.
    *   **Expected `animationProps` (Default Examples):**
        *   `baseFrequency?: number` (Default: `0.001`)
        *   `baseAmplitude?: number` (Default: `30`)
        *   `rippleFrequency?: number` (Default: `0.002`)
        *   `rippleAmplitude?: number` (Default: `15`)
        *   `choppiness?: number` (Default: `0.5`, Range 0-1): Factor to add "noise" or sharper variations.
        *   `spatialFactor?: number` (Default: `0.01`): How position affects the wave.

6.  **`perlinFlow` (Conceptual - Requires noise library)**
    *   **Description:** Fluid and organic movement where vector angles are determined by a Perlin or Simplex noise field that evolves over time.
    *   **Expected `animationProps` (Default Examples):**
        *   `noiseScale?: number` (Default: `0.02`): Noise field scale (smaller values = larger and smoother patterns).
        *   `timeEvolutionSpeed?: number` (Default: `0.0005`): How fast the noise field changes in the temporal dimension.
        *   `angleMultiplier?: number` (Default: `360`): Multiplier to map noise value (usually -1 to 1) to desired angular range (0-360).

7.  **`mouseInteraction`**
    *   **Description:** Vectors react to mouse cursor position within an influence radius.
    *   **Expected `animationProps` (Default Examples):**
        *   `interactionRadius?: number` (Default: `150`): General influence radius around the mouse.
        *   `attractionDistance?: number` (Default: `50`): Closer radius where vectors are strongly attracted/aligned with cursor.
        *   `repulsionDistance?: number` (Default: `150`): Radius where vectors are repelled. (Could be equal to `interactionRadius`).
        *   `effectType?: 'attract' | 'repel' | 'align'` (Default: `'repel'`):
            *   `'attract'`: Point towards the mouse.
            *   `'repel'`: Point away from the mouse.
            *   `'align'`: Align with direction from vector to mouse (or vice versa).
        *   `strength?: number` (Default: `1.0`): Intensity factor or reaction speed.
        *   `alignAngleOffset?: number` (Default: `0`): Angular offset for `repel` or `align` modes.

8.  **`centerPulse`**
    *   **Description:** Generates a wave that propagates from the canvas center (or a defined point), affecting angle, length, thickness and intensity of vectors. Activated via the `pulseTrigger` prop.
    *   **Expected `animationProps`:** A `pulse` sub-object with the following properties (see `applyPulseToVector` for details):
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
        *   `distanceImpactFactor?: number` (Default: `0.3`): How distance to center affects intensity/timing.
        *   `delayPerDistanceUnit?: number` (Default: `0`): Delay based on normalized distance.
        *   `easingFnKey?: string` (Default: `'easeInOutQuad'`): Easing function key for pulse progression.
        *   `angleEasingFnKey?: string` (Default: `'easeOutQuad'`)
        *   `factorEasingFnKey?: string` (Default: `'easeOutElastic'`)
        *   `onPulseComplete?: (vectorId: string) => void`: (This is passed from `VectorGridProps` to the hook).
        *   `onAllPulsesComplete?: () => void`: (This is passed from `VectorGridProps` to the hook).

9.  **`directionalFlow`**
    *   **Description:** Vectors align predominantly in a specified direction, with possible turbulence.
    *   **Expected `animationProps` (Default Examples):**
        *   `flowAngle?: number` (Default: `0`): Main flow angle (0-360).
        *   `turbulence?: number` (Default: `0.2`, Range 0-1): Magnitude of random angle variation.

10. **`tangenteClasica`**
    *   **Description:** Vectors rotate tangentially around the canvas center.
    *   **Expected `animationProps` (Default Examples):**
        *   `rotationSpeed?: number` (Default: `0.0003`): Tangential rotation speed (smaller values = slower).
        *   `direction?: 'clockwise' | 'counterClockwise'` (Default: `'clockwise'`): Rotation direction.

11. **`lissajous` (Conceptual)**
    *   **Description:** Vector angles are derived from Lissajous curve components.
    *   **Expected `animationProps` (Default Examples):**
        *   `xFrequency?: number` (Default: `2`)
        *   `yFrequency?: number` (Default: `3`)
        *   `xAmplitude?: number` (Default: `90`)
        *   `yAmplitude?: number` (Default: `90`)
        *   `phaseOffset?: number` (Default: `Math.PI / 2`)
        *   `timeSpeed?: number` (Default: `0.001`)

12. **`vortex` (Conceptual)**
    *   **Description:** Vectors rotate around a central point (canvas center by default, or mouse position if `useMouseAsCenter` is true).
    *   **Expected `animationProps` (Default Examples):**
        *   `vortexCenterX?: number`, `vortexCenterY?: number`: Vortex center coordinates. If not provided, canvas center is used.
        *   `useMouseAsCenter?: boolean` (Default: `false`): If true, vortex follows mouse (overrides `vortexCenterX/Y`).
        *   `strength?: number` (Default: `0.05`): Influence or rotation speed.
        *   `radiusFalloff?: number` (Default: `1.0`, Range e.g. 0.5-2.0): How vortex strength diminishes with distance (1 = linear, >1 = faster, <1 = slower).
        *   `swirlDirection?: 'clockwise' | 'counterClockwise'` (Default: `'clockwise'`)

---
*(More animation types like `flocking`, `audioReactive`, `followPath` could be added in future iterations, as they are more complex to implement).*

This list should serve as a good guide for implementation and for the control panel UI, where relevant `animationProps` would be displayed when an `animationType` is selected.