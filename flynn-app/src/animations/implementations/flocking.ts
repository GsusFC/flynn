import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';
import { Vector2D } from './helpers/Vector2D';

// --- Estado de la Simulación ---
interface Boid {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
}
let boids: Boid[] = [];
let isInitialized = false;
let lastGridChecksum: number | null = null;


interface FlockingProps {
  perceptionRadius: number;
  maxForce: number;
  maxSpeed: number;
  separationForce: number;
  alignmentForce: number;
  cohesionForce: number;
}

const applyFlocking = ({ vectors, props, dimensions, gridChecksum }: AnimationFrameData<FlockingProps>): AnimationResult => {
  // 1. Inicialización del estado
  if (!isInitialized || boids.length !== vectors.length || lastGridChecksum !== gridChecksum) {
    boids = vectors.map((v: Vector) => ({
      position: new Vector2D(v.x, v.y),
      velocity: new Vector2D(Math.random() * 2 - 1, Math.random() * 2 - 1),
      acceleration: new Vector2D(),
    }));
    isInitialized = true;
    lastGridChecksum = gridChecksum ?? null;
  }

  // 2. Calcular el siguiente estado para cada boid
  for (const boid of boids) {
    let separation = new Vector2D();
    let alignment = new Vector2D();
    let cohesion = new Vector2D();
    let total = 0;

    for (const other of boids) {
      if (boid === other) continue;
      
      const distSq = (boid.position.x - other.position.x)**2 + (boid.position.y - other.position.y)**2;
      
      if (distSq < props.perceptionRadius * props.perceptionRadius) {
        // Separación
        let diff = Vector2D.sub(boid.position, other.position);
        diff.div(distSq); // Ponderar por la inversa del cuadrado de la distancia
        separation.add(diff);

        // Alineación
        alignment.add(other.velocity);

        // Cohesión
        cohesion.add(other.position);
        
        total++;
      }
    }

    if (total > 0) {
      // Promediar y calcular las fuerzas de steering
      separation.div(total).setMag(props.maxSpeed).sub(boid.velocity).limit(props.maxForce);
      alignment.div(total).setMag(props.maxSpeed).sub(boid.velocity).limit(props.maxForce);
      cohesion.div(total);
      const cohesionSteer = Vector2D.sub(cohesion, boid.position).setMag(props.maxSpeed).sub(boid.velocity).limit(props.maxForce);

      // Ponderar y aplicar fuerzas
      separation.mult(props.separationForce);
      alignment.mult(props.alignmentForce);
      cohesionSteer.mult(props.cohesionForce);

      boid.acceleration.add(separation);
      boid.acceleration.add(alignment);
      boid.acceleration.add(cohesionSteer);
    }
  }

  // 3. Actualizar estado y devolver nuevos vectores
  const results = boids.map((boid, i) => {
    // Actualizar velocidad y posición (virtual)
    boid.velocity.add(boid.acceleration);
    boid.velocity.limit(props.maxSpeed);
    boid.position.add(boid.velocity);
    boid.acceleration.mult(0); // Resetear aceleración

    // Envolver alrededor de los bordes (toroidal)
    if (boid.position.x > dimensions.width) boid.position.x = 0;
    if (boid.position.x < 0) boid.position.x = dimensions.width;
    if (boid.position.y > dimensions.height) boid.position.y = 0;
    if (boid.position.y < 0) boid.position.y = dimensions.height;

    const newVector = {
      ...vectors[i],
      angle: boid.velocity.heading(), // Usamos heading() de Vector2D para el ángulo
    };
    
    const data = {
      // Normalizar la velocidad para usarla en el color
      velocity: boid.velocity.mag() / props.maxSpeed, 
    };

    return { vector: newVector, data };
  });
  
  const newVectors = results.map((r: any) => r.vector);
  const animationData = results.map((r: any) => r.data);

  return { vectors: newVectors, animationData };
};

const flockingMeta: AnimationMeta<FlockingProps> = {
  id: 'flocking',
  name: 'Flocking',
  description: 'Simula el comportamiento de una bandada (Boids).',
  category: 'core',
  icon: 'bird',
  
  controls: [
    { id: 'perceptionRadius', type: 'slider', label: 'Radio de Percepción', min: 10, max: 200, step: 1, defaultValue: 50 },
    { id: 'maxSpeed', type: 'slider', label: 'Velocidad Máx', min: 1, max: 10, step: 0.1, defaultValue: 4 },
    { id: 'maxForce', type: 'slider', label: 'Fuerza Máx (giro)', min: 0.1, max: 1, step: 0.05, defaultValue: 0.2 },
    { id: 'separationForce', type: 'slider', label: 'Fuerza Separación', min: 0, max: 2, step: 0.1, defaultValue: 1.5 },
    { id: 'alignmentForce', type: 'slider', label: 'Fuerza Alineación', min: 0, max: 2, step: 0.1, defaultValue: 1.0 },
    { id: 'cohesionForce', type: 'slider', label: 'Fuerza Cohesión', min: 0, max: 2, step: 0.1, defaultValue: 1.0 },
  ],
  
  defaultProps: {
    perceptionRadius: 50,
    maxSpeed: 4,
    maxForce: 0.2,
    separationForce: 1.5,
    alignmentForce: 1.0,
    cohesionForce: 1.0,
  },
  
  apply: applyFlocking,
  // La longitud de los vectores podría depender de su velocidad
  enableLengthDynamics: true, 
};

registerAnimation(flockingMeta); 