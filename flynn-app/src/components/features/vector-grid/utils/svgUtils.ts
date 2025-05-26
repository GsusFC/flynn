/**
 * Utilidades para manejo preciso de coordenadas SVG
 * Basado en las mejores prácticas de victor2
 */

export interface SVGCoordinates {
  x: number | null;
  y: number | null;
}

export interface ScreenCoordinates {
  x: number;
  y: number;
}

export interface BoundingBoxSVG {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convierte coordenadas de pantalla a coordenadas SVG
 * Maneja transformaciones, zoom y escalado correctamente
 */
export function getSVGCoordinates(
  svgElement: SVGSVGElement, 
  event: MouseEvent
): SVGCoordinates {
  try {
    const svgPoint = svgElement.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    
    const CTM = svgElement.getScreenCTM();
    
    if (!CTM) {
      console.warn("No se pudo obtener CTM del elemento SVG");
      return { x: null, y: null };
    }
    
    const inverseCTM = CTM.inverse();
    if (!inverseCTM) {
      console.warn("No se pudo calcular la matriz inversa CTM");
      return { x: null, y: null };
    }
    
    const svgCoords = svgPoint.matrixTransform(inverseCTM);
    return { x: svgCoords.x, y: svgCoords.y };
  } catch (error) {
    console.error("Error calculando coordenadas SVG:", error);
    return { x: null, y: null };
  }
}

/**
 * Convierte coordenadas SVG a coordenadas de pantalla
 */
export function getScreenCoordinates(
  svgElement: SVGSVGElement,
  svgX: number,
  svgY: number
): ScreenCoordinates | null {
  try {
    const svgPoint = svgElement.createSVGPoint();
    svgPoint.x = svgX;
    svgPoint.y = svgY;
    
    const CTM = svgElement.getScreenCTM();
    if (!CTM) {
      console.warn("No se pudo obtener CTM del elemento SVG");
      return null;
    }
    
    const screenCoords = svgPoint.matrixTransform(CTM);
    return { x: screenCoords.x, y: screenCoords.y };
  } catch (error) {
    console.error("Error calculando coordenadas de pantalla:", error);
    return null;
  }
}

/**
 * Obtiene el bounding box en coordenadas SVG
 */
export function getBoundingBoxSVG(svgElement: SVGSVGElement): BoundingBoxSVG | null {
  try {
    const bbox = svgElement.getBBox();
    return {
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height
    };
  } catch (error) {
    console.error("Error obteniendo bounding box SVG:", error);
    return null;
  }
}

/**
 * Verifica si un punto está dentro del área SVG
 */
export function isPointInSVG(
  svgElement: SVGSVGElement,
  x: number,
  y: number
): boolean {
  const bbox = getBoundingBoxSVG(svgElement);
  if (!bbox) return false;
  
  return x >= bbox.x && 
         x <= bbox.x + bbox.width && 
         y >= bbox.y && 
         y <= bbox.y + bbox.height;
}

/**
 * Calcula la distancia entre dos puntos en coordenadas SVG
 */
export function getDistanceSVG(
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normaliza coordenadas SVG a un rango 0-1
 */
export function normalizeSVGCoordinates(
  x: number,
  y: number,
  svgWidth: number,
  svgHeight: number
): { normalizedX: number; normalizedY: number } {
  return {
    normalizedX: Math.max(0, Math.min(1, x / svgWidth)),
    normalizedY: Math.max(0, Math.min(1, y / svgHeight))
  };
}

/**
 * Desnormaliza coordenadas del rango 0-1 a coordenadas SVG
 */
export function denormalizeSVGCoordinates(
  normalizedX: number,
  normalizedY: number,
  svgWidth: number,
  svgHeight: number
): { x: number; y: number } {
  return {
    x: normalizedX * svgWidth,
    y: normalizedY * svgHeight
  };
}

/**
 * Obtiene el centro de un elemento SVG
 */
export function getSVGElementCenter(element: SVGGraphicsElement): { x: number; y: number } | null {
  try {
    const bbox = element.getBBox();
    return {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2
    };
  } catch (error) {
    console.error("Error obteniendo centro del elemento SVG:", error);
    return null;
  }
}

/**
 * Verifica si dos bounding boxes se intersectan
 */
export function boundingBoxesIntersect(
  bbox1: BoundingBoxSVG,
  bbox2: BoundingBoxSVG
): boolean {
  return !(bbox1.x + bbox1.width < bbox2.x || 
           bbox2.x + bbox2.width < bbox1.x || 
           bbox1.y + bbox1.height < bbox2.y || 
           bbox2.y + bbox2.height < bbox1.y);
}

/**
 * Calcula el área de intersección entre dos bounding boxes
 */
export function getBoundingBoxIntersectionArea(
  bbox1: BoundingBoxSVG,
  bbox2: BoundingBoxSVG
): number {
  if (!boundingBoxesIntersect(bbox1, bbox2)) {
    return 0;
  }
  
  const left = Math.max(bbox1.x, bbox2.x);
  const right = Math.min(bbox1.x + bbox1.width, bbox2.x + bbox2.width);
  const top = Math.max(bbox1.y, bbox2.y);
  const bottom = Math.min(bbox1.y + bbox1.height, bbox2.y + bbox2.height);
  
  return (right - left) * (bottom - top);
}
