# Utilidades Técnicas Avanzadas - VectorGrid

Este directorio contiene utilidades técnicas avanzadas inspiradas en las mejores prácticas de victor2, diseñadas para mejorar el rendimiento, precisión y funcionalidad del sistema VectorGrid.

## 📁 Estructura de Archivos

```
utils/
├── svgUtils.ts              # Coordenadas SVG precisas
├── advancedMath.ts          # Matemáticas especializadas  
├── groupUtils.ts            # Sistema de grupos/flotas
├── neighborhoodUtils.ts     # Algoritmos de vecindario optimizados
├── index.ts                 # Exportaciones centralizadas
└── README.md               # Esta documentación
```

## 🔧 Utilidades Implementadas

### 1. **svgUtils.ts** - Coordenadas SVG Precisas

Funciones para manejo preciso de coordenadas y transformaciones SVG.

**Funciones principales:**
- `getSVGCoordinates()` - Conversión pantalla → SVG
- `getScreenCoordinates()` - Conversión SVG → pantalla
- `getBoundingBoxSVG()` - Cálculo de áreas de influencia
- `isPointInSVG()` - Verificación de puntos dentro del SVG
- `normalizeSVGCoordinates()` - Normalización a rango 0-1

**Beneficios:**
- ✅ Interacciones de mouse más precisas
- ✅ Mejor manejo de zoom/escala
- ✅ Base para sistemas de selección avanzados

### 2. **advancedMath.ts** - Matemáticas Especializadas

Funciones matemáticas avanzadas para cálculos complejos de vectores.

**Funciones principales:**
- `calculateInfluenceWeight()` - Peso por distancia con diferentes tipos de caída
- `normalizeAngleDifference()` - Diferencias angulares normalizadas
- `blendAngles()` - Mezcla suave de ángulos con interpolación circular
- `calculateCentroid()` - Centro de masa de grupos
- `averageAngles()` - Promedio de ángulos considerando naturaleza circular

**Beneficios:**
- ✅ Cálculos matemáticos más precisos
- ✅ Funciones de easing avanzadas
- ✅ Base para animaciones complejas

### 3. **groupUtils.ts** - Sistema de Grupos/Flotas

Sistema completo para manejo de grupos y flotas de vectores.

**Funciones principales:**
- `getColorByGroupId()` - Colores automáticos por grupo
- `createSpatialGroups()` - Agrupación por proximidad espacial
- `createGridGroups()` - Agrupación por cuadrícula regular
- `getGroupNeighbors()` - Vecinos del mismo grupo
- `calculateGroupStats()` - Estadísticas de grupos

**Beneficios:**
- ✅ Visualización por categorías
- ✅ Base para flocking y comportamientos colectivos
- ✅ Mejor organización visual

### 4. **neighborhoodUtils.ts** - Algoritmos de Vecindario Optimizados

Algoritmos optimizados para búsqueda de vecinos y análisis espacial.

**Funciones principales:**
- `createSpatialGrid()` - Grid espacial para búsquedas O(1)
- `getNeighborsInRadius()` - Vecinos por radio optimizado
- `getGridNeighbors()` - Vecinos por posición de grid
- `getKNearestNeighbors()` - K vecinos más cercanos
- `findDensityClusters()` - Detección de clusters por densidad

**Beneficios:**
- ✅ Rendimiento mejorado para animaciones complejas
- ✅ Base para flocking, autómatas celulares
- ✅ Escalabilidad para grids grandes

## 🚀 Uso Básico

### Importación Centralizada

```typescript
import {
  // SVG Utils
  getSVGCoordinates,
  getScreenCoordinates,
  
  // Math Utils
  calculateInfluenceWeight,
  blendAngles,
  
  // Group Utils
  getColorByGroupId,
  createSpatialGroups,
  
  // Neighborhood Utils
  createSpatialGrid,
  getNeighborsInRadius
} from '../utils';
```

### Ejemplo: Coordenadas SVG Precisas

```typescript
const handleMouseMove = (event: MouseEvent) => {
  const svgElement = svgRef.current;
  if (!svgElement) return;
  
  const coords = getSVGCoordinates(svgElement, event);
  if (coords.x !== null && coords.y !== null) {
    // Usar coordenadas SVG precisas
    updateMousePosition(coords.x, coords.y);
  }
};
```

### Ejemplo: Sistema de Grupos

```typescript
const vectors = [
  { id: '1', x: 100, y: 100 },
  { id: '2', x: 110, y: 105 },
  // ... más vectores
];

// Crear grupos automáticamente por proximidad
const groups = createSpatialGroups(vectors, 50, 3);

// Obtener color para cada grupo
groups.forEach(group => {
  const color = getColorByGroupId(group.id);
  console.log(`Grupo ${group.id}: ${color}`);
});
```

### Ejemplo: Búsqueda de Vecinos Optimizada

```typescript
// Crear grid espacial
const spatialGrid = createSpatialGrid(vectors, 800, 600, 50);

// Buscar vecinos eficientemente
const neighbors = getNeighborsInRadius(
  spatialGrid,
  vectorsMap,
  mouseX,
  mouseY,
  100 // radio
);

console.log(`Encontrados ${neighbors.count} vecinos`);
```

## 🎯 Casos de Uso Avanzados

### 1. **Interacciones Precisas**
```typescript
// Detección precisa de hover sobre vectores
const isVectorHovered = (vector, mouseEvent) => {
  const coords = getSVGCoordinates(svgElement, mouseEvent);
  return coords.x !== null && 
         isPointInCircle(coords.x, coords.y, vector.x, vector.y, vector.radius);
};
```

### 2. **Animaciones con Influencia por Distancia**
```typescript
// Efecto que disminuye con la distancia
const calculateMouseInfluence = (vectorX, vectorY, mouseX, mouseY) => {
  const distance = getDistance(vectorX, vectorY, mouseX, mouseY);
  const weight = calculateInfluenceWeight(distance, 200, 'smooth');
  return weight; // 0-1, donde 1 es máxima influencia
};
```

### 3. **Detección de Clusters Dinámicos**
```typescript
// Encontrar clusters de vectores automáticamente
const clusters = findDensityClusters(vectors, 75, 0.01);
clusters.forEach(cluster => {
  console.log(`Cluster en (${cluster.center.x}, ${cluster.center.y}) con ${cluster.vectors.length} vectores`);
});
```

## 📊 Optimización de Rendimiento

### Grid Espacial Automático
```typescript
// Optimizar tamaño de celda automáticamente
const optimalCellSize = optimizeCellSize(vectors, 800, 600, 10);
const grid = createSpatialGrid(vectors, 800, 600, optimalCellSize);

// Analizar eficiencia
const efficiency = analyzeSpatialGridEfficiency(grid);
console.log(`Eficiencia del grid: ${(efficiency.efficiency * 100).toFixed(1)}%`);
```

## 🔮 Preparación para Futuras Animaciones

Estas utilidades están diseñadas para soportar las próximas animaciones avanzadas:

- **🐟 Flocking**: `groupUtils` + `neighborhoodUtils`
- **🌊 OceanCurrents**: `advancedMath` + múltiples grupos
- **🔄 CellularAutomata**: `neighborhoodUtils` + grid optimizado
- **📍 FollowPath**: `svgUtils` + matemáticas precisas

## 🛠️ Extensibilidad

El sistema está diseñado para ser fácilmente extensible:

1. **Nuevas funciones matemáticas** → `advancedMath.ts`
2. **Algoritmos de agrupación** → `groupUtils.ts`
3. **Métodos de búsqueda** → `neighborhoodUtils.ts`
4. **Utilidades SVG** → `svgUtils.ts`

## 📈 Métricas de Rendimiento

### Comparación de Algoritmos de Búsqueda

| Método | Complejidad | Mejor para |
|--------|-------------|------------|
| Búsqueda Lineal | O(n) | < 100 vectores |
| Grid Espacial | O(1) | > 100 vectores |
| K-Nearest | O(n log n) | Búsquedas específicas |

### Recomendaciones de Uso

- **Grids pequeños (< 500 vectores)**: Búsqueda lineal
- **Grids medianos (500-2000)**: Grid espacial con celdas de 50px
- **Grids grandes (> 2000)**: Grid espacial optimizado automáticamente

## 🔧 Configuración Recomendada

```typescript
// Configuración óptima para diferentes tamaños de grid
const getOptimalConfig = (vectorCount: number) => {
  if (vectorCount < 500) {
    return { useLinearSearch: true };
  } else if (vectorCount < 2000) {
    return { useSpatialGrid: true, cellSize: 50 };
  } else {
    return { 
      useSpatialGrid: true, 
      cellSize: 'auto', // Calculado automáticamente
      enableClustering: true 
    };
  }
};
```

---

**Nota**: Estas utilidades están basadas en las mejores prácticas de victor2 y han sido adaptadas específicamente para el ecosistema Flynn VectorGrid, manteniendo compatibilidad total con el sistema existente.
