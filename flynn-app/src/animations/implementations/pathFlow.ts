import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector, SelectControlDef } from '../types';
import { Vector2D } from './helpers/Vector2D'; // Suponiendo que hemos movido Vector2D a un helper

const PATH_TYPES = ['circle', 'sineWave', 'lemniscate'] as const;
type PathType = typeof PATH_TYPES[number];

interface PathFlowProps {
  pathType: PathType;
  influenceRadius: number;
  pathForce: number; // No se usará directamente, pero útil para futuro blending
}

// --- Generación de Trazados ---
function generatePath(type: PathType, width: number, height: number): Vector2D[] {
  const path: Vector2D[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const numPoints = 100;

  switch (type) {
    case 'circle': {
      const radius = Math.min(width, height) * 0.4;
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        path.push(new Vector2D(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius));
      }
      break;
    }
    case 'sineWave': {
      const amplitude = height * 0.2;
      const frequency = 3;
      for (let i = 0; i <= numPoints; i++) {
        const x = (i / numPoints) * width;
        const y = centerY + Math.sin((i / numPoints) * Math.PI * 2 * frequency) * amplitude;
        path.push(new Vector2D(x, y));
      }
      break;
    }
    case 'lemniscate': { // Lemniscate of Bernoulli
      const a = width * 0.4;
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const scale = 1 + Math.sin(t) * Math.sin(t);
        const x = centerX + a * Math.cos(t) / scale;
        const y = centerY + a * Math.sin(t) * Math.cos(t) / scale;
        path.push(new Vector2D(x, y));
      }
      break;
    }
  }
  return path;
}

// --- Lógica de la Animación ---
const applyPathFlow = ({ vectors, props, dimensions }: AnimationFrameData<PathFlowProps>): AnimationResult => {
  const path = generatePath(props.pathType, dimensions.width, dimensions.height);
  if (path.length < 2) return { vectors: [...vectors], animationData: [] };
  
  const newVectors = vectors.map(vec => {
    const p = new Vector2D(vec.x, vec.y);
    let minDistanceSq = Infinity;
    let pathAngle = 0;

    // Encontrar el punto más cercano en el trazado
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const ap = Vector2D.sub(p, a);
      const ab = Vector2D.sub(b, a);
      const abMagSq = ab.magSq();
      
      let t = abMagSq === 0 ? 0 : ap.dot(ab) / abMagSq;
      t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]
      
      const closestPointOnSegment = a.clone().add(ab.mult(t));
      const distSq = p.distSq(closestPointOnSegment);

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        pathAngle = Vector2D.sub(b, a).heading();
      }
    }

    const distance = Math.sqrt(minDistanceSq);
    if (distance < props.influenceRadius) {
      // Interpolar suavemente hacia el ángulo del trazado
      const influence = 1 - (distance / props.influenceRadius);
      // Lerp de ángulo (forma simple)
      const angleDiff = ((((pathAngle - vec.angle) % (2 * Math.PI)) + (3 * Math.PI)) % (2 * Math.PI)) - Math.PI;
      return { ...vec, angle: vec.angle + angleDiff * influence * props.pathForce };
    }
    
    return vec;
  });

  return { vectors: newVectors, animationData: [] };
};


const pathFlowMeta: AnimationMeta<PathFlowProps> = {
  id: 'pathFlow',
  name: 'Path Flow',
  description: 'Los vectores siguen trazados predefinidos.',
  category: 'core',
  icon: 'git-commit',
  
  controls: [
    {
      id: 'pathType',
      type: 'select',
      label: 'Tipo de Trazado',
      defaultValue: 'circle',
      options: [
        { value: 'circle', label: 'Círculo' },
        { value: 'sineWave', label: 'Onda Sinusoidal' },
        { value: 'lemniscate', label: 'Lemniscata' },
      ],
    } as SelectControlDef<PathType>,
    { id: 'influenceRadius', type: 'slider', label: 'Radio de Influencia', min: 10, max: 300, step: 5, defaultValue: 150 },
    { id: 'pathForce', type: 'slider', label: 'Fuerza de Seguimiento', min: 0, max: 1, step: 0.05, defaultValue: 0.5 },
  ],
  
  defaultProps: {
    pathType: 'circle',
    influenceRadius: 150,
    pathForce: 0.5,
  },
  
  apply: applyPathFlow,
  enableLengthDynamics: false,
};

registerAnimation(pathFlowMeta); 