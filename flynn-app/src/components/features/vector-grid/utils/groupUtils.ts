/**
 * Utilidades para manejo de grupos/flotas de vectores
 * Basado en las mejores prácticas de victor2
 */

export interface VectorGroup {
  id: number;
  name: string;
  color: string;
  vectorIds: string[];
  centerX?: number;
  centerY?: number;
  radius?: number;
}

export interface GroupedVector {
  id: string;
  groupId: number;
  x: number;
  y: number;
  [key: string]: unknown; // Para propiedades adicionales del vector
}

/**
 * Paleta de colores predefinida para grupos
 * Basada en la función getColorByFlockId de victor2
 */
const DEFAULT_GROUP_COLORS = [
  "#ffffff", // Blanco (default/sin grupo)
  "#64b5f6", // Azul claro
  "#81c784", // Verde claro
  "#e57373", // Rojo claro
  "#ffb74d", // Naranja
  "#ba68c8", // Púrpura
  "#4fc3f7", // Cian claro
  "#aed581", // Verde lima
  "#ffb74d", // Ámbar
  "#f06292", // Rosa
  "#9575cd", // Violeta
  "#4db6ac", // Teal
];

/**
 * Obtiene el color asignado a un grupo específico
 */
export function getColorByGroupId(groupId: number): string {
  return DEFAULT_GROUP_COLORS[groupId % DEFAULT_GROUP_COLORS.length];
}

/**
 * Crea grupos automáticamente basados en proximidad espacial
 */
export function createSpatialGroups(
  vectors: Array<{ id: string; x: number; y: number }>,
  maxGroupRadius: number = 100,
  minGroupSize: number = 3
): VectorGroup[] {
  const groups: VectorGroup[] = [];
  const processedVectors = new Set<string>();
  let groupIdCounter = 1;

  vectors.forEach(vector => {
    if (processedVectors.has(vector.id)) return;

    // Encontrar vectores cercanos
    const nearbyVectors = vectors.filter(other => {
      if (processedVectors.has(other.id) || other.id === vector.id) return false;
      
      const distance = Math.sqrt(
        Math.pow(other.x - vector.x, 2) + Math.pow(other.y - vector.y, 2)
      );
      
      return distance <= maxGroupRadius;
    });

    // Solo crear grupo si hay suficientes vectores
    if (nearbyVectors.length >= minGroupSize - 1) { // -1 porque no incluye el vector actual
      const groupVectors = [vector, ...nearbyVectors];
      
      // Calcular centro del grupo
      const centerX = groupVectors.reduce((sum, v) => sum + v.x, 0) / groupVectors.length;
      const centerY = groupVectors.reduce((sum, v) => sum + v.y, 0) / groupVectors.length;
      
      const group: VectorGroup = {
        id: groupIdCounter++,
        name: `Grupo ${groupIdCounter - 1}`,
        color: getColorByGroupId(groupIdCounter - 1),
        vectorIds: groupVectors.map(v => v.id),
        centerX,
        centerY,
        radius: maxGroupRadius
      };
      
      groups.push(group);
      
      // Marcar vectores como procesados
      groupVectors.forEach(v => processedVectors.add(v.id));
    }
  });

  return groups;
}

/**
 * Crea grupos basados en una cuadrícula regular
 */
export function createGridGroups(
  vectors: Array<{ id: string; x: number; y: number }>,
  gridWidth: number,
  gridHeight: number,
  groupsPerRow: number = 3,
  groupsPerCol: number = 3
): VectorGroup[] {
  const groups: VectorGroup[] = [];
  const cellWidth = gridWidth / groupsPerRow;
  const cellHeight = gridHeight / groupsPerCol;
  
  let groupIdCounter = 1;

  for (let row = 0; row < groupsPerCol; row++) {
    for (let col = 0; col < groupsPerRow; col++) {
      const cellX = col * cellWidth;
      const cellY = row * cellHeight;
      
      // Encontrar vectores en esta celda
      const vectorsInCell = vectors.filter(vector => 
        vector.x >= cellX && 
        vector.x < cellX + cellWidth &&
        vector.y >= cellY && 
        vector.y < cellY + cellHeight
      );
      
      if (vectorsInCell.length > 0) {
        const group: VectorGroup = {
          id: groupIdCounter++,
          name: `Grupo ${row}-${col}`,
          color: getColorByGroupId(groupIdCounter - 1),
          vectorIds: vectorsInCell.map(v => v.id),
          centerX: cellX + cellWidth / 2,
          centerY: cellY + cellHeight / 2,
          radius: Math.min(cellWidth, cellHeight) / 2
        };
        
        groups.push(group);
      }
    }
  }

  return groups;
}

/**
 * Asigna vectores a grupos de forma aleatoria
 */
export function createRandomGroups(
  vectors: Array<{ id: string; x: number; y: number }>,
  numberOfGroups: number = 4,
  minGroupSize: number = 2
): VectorGroup[] {
  const groups: VectorGroup[] = [];
  const shuffledVectors = [...vectors].sort(() => Math.random() - 0.5);
  
  // Inicializar grupos vacíos
  for (let i = 0; i < numberOfGroups; i++) {
    groups.push({
      id: i + 1,
      name: `Grupo ${i + 1}`,
      color: getColorByGroupId(i + 1),
      vectorIds: []
    });
  }
  
  // Distribuir vectores
  shuffledVectors.forEach((vector, index) => {
    const groupIndex = index % numberOfGroups;
    groups[groupIndex].vectorIds.push(vector.id);
  });
  
  // Filtrar grupos que no cumplen el tamaño mínimo
  const validGroups = groups.filter(group => group.vectorIds.length >= minGroupSize);
  
  // Recalcular centros para grupos válidos
  validGroups.forEach(group => {
    const groupVectors = vectors.filter(v => group.vectorIds.includes(v.id));
    if (groupVectors.length > 0) {
      group.centerX = groupVectors.reduce((sum, v) => sum + v.x, 0) / groupVectors.length;
      group.centerY = groupVectors.reduce((sum, v) => sum + v.y, 0) / groupVectors.length;
    }
  });
  
  return validGroups;
}

/**
 * Obtiene todos los vectores que pertenecen a un grupo específico
 */
export function getVectorsByGroupId(
  vectors: GroupedVector[],
  groupId: number
): GroupedVector[] {
  return vectors.filter(vector => vector.groupId === groupId);
}

/**
 * Obtiene los vecinos del mismo grupo para un vector específico
 */
export function getGroupNeighbors(
  vectors: GroupedVector[],
  targetVectorId: string,
  maxDistance?: number
): GroupedVector[] {
  const targetVector = vectors.find(v => v.id === targetVectorId);
  if (!targetVector) return [];
  
  const sameGroupVectors = getVectorsByGroupId(vectors, targetVector.groupId)
    .filter(v => v.id !== targetVectorId);
  
  if (maxDistance === undefined) {
    return sameGroupVectors;
  }
  
  return sameGroupVectors.filter(vector => {
    const distance = Math.sqrt(
      Math.pow(vector.x - targetVector.x, 2) + 
      Math.pow(vector.y - targetVector.y, 2)
    );
    return distance <= maxDistance;
  });
}

/**
 * Calcula estadísticas de un grupo
 */
export function calculateGroupStats(
  vectors: GroupedVector[],
  groupId: number
): {
  count: number;
  centerX: number;
  centerY: number;
  averageDistance: number;
  maxDistance: number;
  boundingBox: { minX: number; minY: number; maxX: number; maxY: number };
} {
  const groupVectors = getVectorsByGroupId(vectors, groupId);
  
  if (groupVectors.length === 0) {
    return {
      count: 0,
      centerX: 0,
      centerY: 0,
      averageDistance: 0,
      maxDistance: 0,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    };
  }
  
  // Calcular centro
  const centerX = groupVectors.reduce((sum, v) => sum + v.x, 0) / groupVectors.length;
  const centerY = groupVectors.reduce((sum, v) => sum + v.y, 0) / groupVectors.length;
  
  // Calcular distancias desde el centro
  const distances = groupVectors.map(v => 
    Math.sqrt(Math.pow(v.x - centerX, 2) + Math.pow(v.y - centerY, 2))
  );
  
  const averageDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const maxDistance = Math.max(...distances);
  
  // Calcular bounding box
  const xs = groupVectors.map(v => v.x);
  const ys = groupVectors.map(v => v.y);
  
  return {
    count: groupVectors.length,
    centerX,
    centerY,
    averageDistance,
    maxDistance,
    boundingBox: {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys)
    }
  };
}

/**
 * Actualiza la posición del centro de un grupo basado en sus vectores
 */
export function updateGroupCenter(
  group: VectorGroup,
  vectors: Array<{ id: string; x: number; y: number }>
): VectorGroup {
  const groupVectors = vectors.filter(v => group.vectorIds.includes(v.id));
  
  if (groupVectors.length === 0) {
    return group;
  }
  
  const centerX = groupVectors.reduce((sum, v) => sum + v.x, 0) / groupVectors.length;
  const centerY = groupVectors.reduce((sum, v) => sum + v.y, 0) / groupVectors.length;
  
  return {
    ...group,
    centerX,
    centerY
  };
}

/**
 * Fusiona dos grupos en uno solo
 */
export function mergeGroups(group1: VectorGroup, group2: VectorGroup): VectorGroup {
  return {
    id: group1.id, // Mantener el ID del primer grupo
    name: `${group1.name} + ${group2.name}`,
    color: group1.color, // Mantener el color del primer grupo
    vectorIds: [...group1.vectorIds, ...group2.vectorIds],
    centerX: group1.centerX && group2.centerX ? 
      (group1.centerX + group2.centerX) / 2 : 
      group1.centerX || group2.centerX,
    centerY: group1.centerY && group2.centerY ? 
      (group1.centerY + group2.centerY) / 2 : 
      group1.centerY || group2.centerY,
    radius: group1.radius && group2.radius ? 
      Math.max(group1.radius, group2.radius) : 
      group1.radius || group2.radius
  };
}

/**
 * Divide un grupo en subgrupos más pequeños
 */
export function splitGroup(
  group: VectorGroup,
  vectors: Array<{ id: string; x: number; y: number }>,
  numberOfSubgroups: number = 2
): VectorGroup[] {
  const groupVectors = vectors.filter(v => group.vectorIds.includes(v.id));
  
  if (groupVectors.length < numberOfSubgroups) {
    return [group]; // No se puede dividir
  }
  
  const subgroups: VectorGroup[] = [];
  const vectorsPerSubgroup = Math.ceil(groupVectors.length / numberOfSubgroups);
  
  for (let i = 0; i < numberOfSubgroups; i++) {
    const startIndex = i * vectorsPerSubgroup;
    const endIndex = Math.min(startIndex + vectorsPerSubgroup, groupVectors.length);
    const subgroupVectors = groupVectors.slice(startIndex, endIndex);
    
    if (subgroupVectors.length > 0) {
      const centerX = subgroupVectors.reduce((sum, v) => sum + v.x, 0) / subgroupVectors.length;
      const centerY = subgroupVectors.reduce((sum, v) => sum + v.y, 0) / subgroupVectors.length;
      
      subgroups.push({
        id: group.id * 10 + i + 1, // Generar nuevo ID único
        name: `${group.name}-${i + 1}`,
        color: getColorByGroupId(group.id * 10 + i + 1),
        vectorIds: subgroupVectors.map(v => v.id),
        centerX,
        centerY,
        radius: group.radius
      });
    }
  }
  
  return subgroups;
}

/**
 * Encuentra el grupo más cercano a un punto específico
 */
export function findNearestGroup(
  groups: VectorGroup[],
  x: number,
  y: number
): VectorGroup | null {
  if (groups.length === 0) return null;
  
  let nearestGroup = groups[0];
  let minDistance = Infinity;
  
  groups.forEach(group => {
    if (group.centerX !== undefined && group.centerY !== undefined) {
      const distance = Math.sqrt(
        Math.pow(group.centerX - x, 2) + Math.pow(group.centerY - y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestGroup = group;
      }
    }
  });
  
  return nearestGroup;
}
