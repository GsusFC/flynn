import { registerAnimation } from '../registry';
import type { AnimationMeta, AnimationFrameData, AnimationResult, Vector } from '../types';

// No hay props para una animación estática
type StaticProps = Record<string, never>;

// La lógica simplemente devuelve los vectores sin modificarlos
const applyStatic = ({ vectors, dimensions }: AnimationFrameData<StaticProps>): AnimationResult => {
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const maxDist = Math.sqrt(centerX**2 + centerY**2);

  const animationData = vectors.map((vector: Vector) => {
    const dx = vector.x - centerX;
    const dy = vector.y - centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx);
    return {
      distance: dist / maxDist, // Normalizar
      angle: (angle + Math.PI) / (2 * Math.PI), // Normalizar
      fieldStrength: 0.5, // Valor neutro
    };
  });
  
  return { vectors: [...vectors], animationData };
};

// Meta
const staticMeta: AnimationMeta<StaticProps> = {
  id: 'static',
  name: 'Static',
  description: 'Los vectores permanecen estáticos. No se aplica ninguna animación.',
  category: 'core',
  icon: 'pause',
  
  controls: [], // No tiene controles
  
  defaultProps: {},
  
  apply: applyStatic,

  // Deshabilitamos Length Dynamics para que los vectores sean verdaderamente estáticos
  enableLengthDynamics: false, 
};

// Registro
registerAnimation(staticMeta); 