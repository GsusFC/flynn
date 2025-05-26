# Guía de Contribución - Flynn Vector Grid

¡Gracias por tu interés en contribuir a Flynn Vector Grid! Esta guía te ayudará a empezar.

## 🚀 Inicio Rápido para Contribuidores

### 1. Setup del Entorno

```bash
# Fork del repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/tu-usuario/flynn.git
cd flynn/flynn-app

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### 2. Estructura de Ramas

- `main` - Rama principal estable
- `develop` - Desarrollo activo
- `feature/nombre-feature` - Nuevas características
- `fix/descripcion-bug` - Correcciones de bugs
- `docs/tema` - Mejoras de documentación

### 3. Flujo de Trabajo

```bash
# Crear rama para tu contribución
git checkout -b feature/mi-nueva-animacion

# Hacer tus cambios...
# Commitear siguiendo convenciones
git commit -m "🎨 feat: Add spiral wave animation"

# Push y crear Pull Request
git push origin feature/mi-nueva-animacion
```

## 📝 Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) con emojis:

### Tipos de Commit

| Emoji | Tipo | Descripción |
|-------|------|-------------|
| 🎨 | `feat` | Nueva funcionalidad |
| 🔧 | `fix` | Corrección de bugs |
| ⚡ | `perf` | Mejora de performance |
| 📚 | `docs` | Documentación |
| 🧪 | `test` | Tests |
| 🔨 | `refactor` | Refactoring |
| 💅 | `style` | Cambios de estilo/formato |
| 🔧 | `chore` | Tareas de mantenimiento |

### Ejemplos

```bash
# Nueva animación
git commit -m "🎨 feat: Add magnetic field animation with configurable poles"

# Fix de performance
git commit -m "⚡ perf: Optimize vector angle calculations in smoothWaves"

# Documentación
git commit -m "📚 docs: Add advanced usage examples for dynamic vectors"

# Bug fix
git commit -m "🔧 fix: Prevent infinite loop in angle normalization"
```

## 🎨 Contribuir con Nuevas Animaciones

### Template para Nueva Animación

```typescript
// src/components/features/vector-grid/simple/animations/implementations/miAnimacion.ts

import type { SimpleVector, AnimationProps } from '../simpleTypes';
import { normalizeAngle } from '../base/utils';

/**
 * Props para la animación MiAnimacion
 */
interface MiAnimacionProps {
  intensity: number;      // Intensidad del efecto (0.1 - 3.0)
  speed: number;          // Velocidad de animación (0.0001 - 0.01)
  pattern: 'type1' | 'type2'; // Tipo de patrón
}

/**
 * Implementación de MiAnimacion
 * 
 * Descripción: Explicar qué hace esta animación, cómo funciona,
 * y cualquier consideración especial de performance o uso.
 */
export const miAnimacion = {
  /**
   * Aplica la animación a los vectores
   */
  applyAnimation: (
    vectors: SimpleVector[], 
    props: MiAnimacionProps, 
    time: number
  ): SimpleVector[] => {
    
    // Pre-cálculos (optimización importante)
    const timePhase = time * props.speed;
    const amplitude = props.intensity * 45; // Convertir a grados
    
    return vectors.map(vector => {
      // Lógica específica de la animación
      const newAngle = calculateAnimationAngle(vector, props, timePhase, amplitude);
      
      return {
        ...vector,
        angle: normalizeAngle(newAngle)
      };
    });
  },

  /**
   * Props por defecto
   */
  getDefaultProps: (): MiAnimacionProps => ({
    intensity: 1.0,
    speed: 0.001,
    pattern: 'type1'
  }),

  /**
   * Validación y normalización de props
   */
  validateProps: (props: any): MiAnimacionProps => ({
    intensity: Math.max(0.1, Math.min(3.0, props.intensity ?? 1.0)),
    speed: Math.max(0.0001, Math.min(0.01, props.speed ?? 0.001)),
    pattern: ['type1', 'type2'].includes(props.pattern) ? props.pattern : 'type1'
  })
};

/**
 * Función auxiliar para calcular el ángulo
 */
function calculateAnimationAngle(
  vector: SimpleVector,
  props: MiAnimacionProps,
  timePhase: number,
  amplitude: number
): number {
  // Implementar la lógica matemática aquí
  // Ejemplo básico:
  return vector.originalAngle + Math.sin(timePhase + vector.x * 0.01) * amplitude;
}
```

### Checklist para Nueva Animación

- [ ] **Implementación completa** con las 3 funciones requeridas
- [ ] **Documentación JSDoc** explicando el propósito y funcionamiento
- [ ] **Props validadas** con rangos apropiados
- [ ] **Optimizaciones de performance** (pre-cálculos, cache, etc.)
- [ ] **Pruebas** con diferentes configuraciones de grid
- [ ] **Registro en animationEngine.ts**
- [ ] **Añadido a getDefaultProps en page.tsx**

### Registro de la Animación

```typescript
// src/components/features/vector-grid/simple/animations/animationEngine.ts
import { miAnimacion } from './implementations/miAnimacion';

export const animationRegistry = {
  // ... animaciones existentes
  miAnimacion
};
```

```typescript
// src/app/page.tsx - función getDefaultProps
function getDefaultProps(animationType: string): Record<string, unknown> {
  switch (animationType) {
    // ... casos existentes
    case 'miAnimacion':
      return animationRegistry.miAnimacion.getDefaultProps();
    default:
      return {};
  }
}
```

## 🔧 Contribuir con Optimizaciones

### Performance Guidelines

1. **Medir antes de optimizar**:
   ```typescript
   const startTime = performance.now();
   // ... código a optimizar
   const endTime = performance.now();
   console.log(`Operación tomó ${endTime - startTime}ms`);
   ```

2. **Priorizar optimizaciones**:
   - **Alto impacto**: Loops con muchas iteraciones
   - **Medio impacto**: Cálculos matemáticos complejos
   - **Bajo impacto**: Acceso a propiedades

3. **Técnicas recomendadas**:
   - Cache de resultados costosos
   - Pre-cálculo de constantes
   - Evitar operaciones en loops
   - Usar tipado estricto

### Code Review Checklist

- [ ] **No regresiones** de performance
- [ ] **Tipado TypeScript** completo
- [ ] **Tests** para nueva funcionalidad
- [ ] **Documentación** actualizada
- [ ] **Convenciones** de código seguidas
- [ ] **No warnings** de ESLint

## 🧪 Testing

### Testing Manual

```typescript
// Configuración de test estándar
const testConfigs = [
  { rows: 10, cols: 15 },    // Small grid
  { rows: 20, cols: 30 },    // Medium grid  
  { rows: 50, cols: 50 }     // Large grid (stress test)
];

// Animaciones a probar
const testAnimations = [
  'smoothWaves',
  'seaWaves', 
  'geometricPattern',
  'nueva-animacion'
];
```

### Performance Testing

```bash
# Configuración de stress test
- Grid: 50x50 (2500 vectores)
- Animación: La más compleja disponible
- Duración: 5 minutos mínimo
- Métrica objetivo: >30 FPS promedio
```

## 📚 Documentación

### Cuando Actualizar Docs

- **Nuevas animaciones**: Actualizar `ANIMATIONS.md` y `API.md`
- **Cambios de API**: Actualizar `API.md`
- **Optimizaciones**: Actualizar `PERFORMANCE.md`
- **Arquitectura**: Actualizar `ARCHITECTURE.md`

### Estilo de Documentación

```markdown
## Título

Descripción breve del concepto.

### Subsección

Explicación detallada con ejemplos de código:

```typescript
// Ejemplo con comentarios explicativos
const ejemplo = {
  prop: 'valor' // Explicar qué hace esta prop
};
```

**Notas importantes** en negrita.

| Tabla | Con | Información |
|-------|-----|-------------|
| Clara | Y   | Concisa     |
```

## 🐛 Reporte de Bugs

### Template de Issue

```markdown
**Descripción del Bug**
Descripción clara y concisa del problema.

**Pasos para Reproducir**
1. Configurar grid con...
2. Seleccionar animación...
3. Ajustar parámetro...
4. Observar error...

**Comportamiento Esperado**
Qué debería pasar.

**Comportamiento Actual**
Qué pasa realmente.

**Información del Sistema**
- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari + versión]
- Tamaño del grid: [filas x columnas]
- Animación activa: [nombre]

**Logs de Consola**
```
Pegar logs relevantes aquí
```

**Screenshots/Videos**
Si es posible, adjuntar evidencia visual.
```

## 🎯 Roadmap y Prioridades

### High Priority
- Nuevas animaciones visuales
- Optimizaciones de performance
- Mejoras de experiencia de usuario

### Medium Priority  
- Sistema de plugins
- Exportación a formatos adicionales
- Animaciones basadas en audio

### Low Priority
- Renderizado WebGL
- Efectos 3D
- Editor visual de animaciones

## 💬 Comunicación

### Canales

- **GitHub Issues**: Para bugs y feature requests
- **GitHub Discussions**: Para preguntas y ideas
- **Pull Requests**: Para contribuciones de código

### Etiquetas de Issues

- `bug` - Problema confirmado
- `enhancement` - Nueva funcionalidad
- `performance` - Optimización
- `documentation` - Mejora de docs
- `good first issue` - Para principiantes
- `help wanted` - Necesita contribuidores

## 🏆 Reconocimientos

Todos los contribuidores serán reconocidos en:

- README principal del proyecto
- Release notes de versiones
- Documentación de créditos

### Tipos de Contribución

- 🎨 **Animaciones**: Nuevos algoritmos visuales
- ⚡ **Performance**: Optimizaciones y mejoras
- 📚 **Documentación**: Guías y ejemplos
- 🐛 **Bug Fixes**: Correcciones de problemas
- 🧪 **Testing**: Pruebas y validación
- 💡 **Ideas**: Propuestas y feedback

¡Gracias por contribuir a Flynn Vector Grid! 🚀