# 🎨 Guía para Crear Animaciones Personalizadas

Esta guía te ayudará a crear tus propias animaciones para el sistema VectorGrid.

## 📋 Estructura Básica

Cada animación debe seguir esta estructura:

```typescript
// mi-animacion.ts
import { createSimpleAnimation } from '../base/AnimationBase';
import type { SimpleVector } from '../../simpleTypes';
import type { AnimationContext } from '../types';

// 1. Definir las props de tu animación
interface MiAnimacionProps {
  parametro1: number;
  parametro2: string;
  // ... más parámetros
}

// 2. Implementar la función de animación
const animateMiAnimacion = (
  vectors: SimpleVector[],
  props: MiAnimacionProps,
  context: AnimationContext
): SimpleVector[] => {
  return vectors.map(vector => {
    // Tu lógica de animación aquí
    const nuevoAngulo = calcularNuevoAngulo(vector, props, context);
    
    return {
      ...vector,
      angle: nuevoAngulo
    };
  });
};

// 3. Validación opcional
const validateProps = (props: MiAnimacionProps): boolean => {
  // Validar props aquí
  return true;
};

// 4. Exportar la animación
export const miAnimacion = createSimpleAnimation<MiAnimacionProps>({
  id: 'miAnimacion',
  name: 'Mi Animación',
  description: 'Descripción de lo que hace mi animación',
  category: 'custom', // basic | waves | interaction | flow | advanced | custom
  icon: '✨',
  controls: [
    {
      id: 'parametro1',
      label: 'Parámetro 1',
      type: 'slider',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 50,
      description: 'Descripción del parámetro',
      icon: '🎛️'
    }
    // ... más controles
  ],
  defaultProps: {
    parametro1: 50,
    parametro2: 'valor'
  },
  animate: animateMiAnimacion,
  validateProps
});
```

## 🎛️ Tipos de Controles Disponibles

### Slider
```typescript
{
  id: 'velocidad',
  label: 'Velocidad',
  type: 'slider',
  min: 0.1,
  max: 2.0,
  step: 0.1,
  defaultValue: 1.0,
  description: 'Velocidad de la animación',
  icon: '⚡'
}
```

### Select
```typescript
{
  id: 'direccion',
  label: 'Dirección',
  type: 'select',
  options: [
    { value: 'clockwise', label: 'Horario' },
    { value: 'counterClockwise', label: 'Antihorario' }
  ],
  defaultValue: 'clockwise',
  description: 'Dirección de rotación',
  icon: '🔄'
}
```

### Toggle
```typescript
{
  id: 'activo',
  label: 'Activar efecto',
  type: 'toggle',
  defaultValue: true,
  description: 'Activar o desactivar el efecto',
  icon: '🔘'
}
```

### Color
```typescript
{
  id: 'color',
  label: 'Color',
  type: 'color',
  defaultValue: '#ff0000',
  description: 'Color del efecto',
  icon: '🎨'
}
```

## 📊 Contexto de Animación

El objeto `context` contiene información útil:

```typescript
interface AnimationContext {
  time: number;              // Tiempo actual en ms
  mousePosition: {           // Posición del mouse
    x: number | null;
    y: number | null;
  };
  pulseCenter: {             // Centro del último pulso
    x: number;
    y: number;
  } | null;
  pulseStartTime: number | null; // Tiempo de inicio del pulso
  canvasWidth: number;       // Ancho del canvas
  canvasHeight: number;      // Alto del canvas
}
```

## 🛠️ Utilidades Disponibles

Puedes importar utilidades desde `../base/utils`:

```typescript
import { 
  normalizeAngle,     // Normalizar ángulos (0-360)
  distance,           // Calcular distancia entre puntos
  lerp,              // Interpolación lineal
  mapRange,          // Mapear valores entre rangos
  easeInOutQuad,     // Función de easing
  createNoiseGenerator // Generador de ruido
} from '../base/utils';
```

## 📝 Ejemplos de Animaciones

### Ejemplo 1: Rotación Simple
```typescript
const animateRotacion = (vectors, props, context) => {
  const rotationSpeed = props.velocidad * 0.001;
  const rotation = context.time * rotationSpeed;
  
  return vectors.map(vector => ({
    ...vector,
    angle: normalizeAngle(vector.originalAngle + rotation)
  }));
};
```

### Ejemplo 2: Efecto de Ondas
```typescript
const animateOndas = (vectors, props, context) => {
  return vectors.map(vector => {
    const wave = Math.sin(
      (vector.originalX * props.frecuencia) + 
      (context.time * props.velocidad * 0.001)
    );
    
    const angleOffset = wave * props.amplitud;
    
    return {
      ...vector,
      angle: normalizeAngle(vector.originalAngle + angleOffset)
    };
  });
};
```

### Ejemplo 3: Interacción con Mouse
```typescript
const animateMouseEffect = (vectors, props, context) => {
  if (!context.mousePosition.x || !context.mousePosition.y) {
    return vectors;
  }
  
  return vectors.map(vector => {
    const dist = distance(
      vector.x, vector.y,
      context.mousePosition.x, context.mousePosition.y
    );
    
    if (dist < props.radio) {
      const influence = 1 - (dist / props.radio);
      const angleToMouse = Math.atan2(
        context.mousePosition.y - vector.y,
        context.mousePosition.x - vector.x
      ) * (180 / Math.PI);
      
      const finalAngle = lerp(
        vector.originalAngle,
        angleToMouse,
        influence * props.intensidad
      );
      
      return {
        ...vector,
        angle: normalizeAngle(finalAngle)
      };
    }
    
    return vector;
  });
};
```

## 🔧 Registro de Animaciones

Para registrar tu animación:

```typescript
// En tu archivo de animación
export const miAnimacion = createSimpleAnimation({ ... });

// En el registry principal (../index.ts)
import { miAnimacion } from './custom/mi-animacion';
import { registerAnimation } from '../index';

// Registrar la animación
registerAnimation(miAnimacion);
```

## ✅ Mejores Prácticas

1. **Rendimiento**: Evita cálculos complejos en cada frame
2. **Validación**: Siempre valida las props de entrada
3. **Normalización**: Usa `normalizeAngle()` para ángulos
4. **Documentación**: Describe claramente qué hace tu animación
5. **Iconos**: Usa emojis descriptivos para los controles
6. **Categorías**: Asigna la categoría apropiada
7. **Nombres**: Usa nombres descriptivos y únicos

## 🐛 Debugging

Para debuggear tu animación:

```typescript
const animateMiAnimacion = (vectors, props, context) => {
  console.log('Props:', props);
  console.log('Context:', context);
  console.log('Vectors count:', vectors.length);
  
  // Tu lógica aquí...
  
  return vectors;
};
```

## 📚 Recursos Adicionales

- Mira las animaciones existentes en `../implementations/`
- Usa la clase base `AnimationBase` para animaciones más complejas
- Consulta los tipos en `../types.ts` para referencia completa

¡Diviértete creando animaciones increíbles! 🚀
