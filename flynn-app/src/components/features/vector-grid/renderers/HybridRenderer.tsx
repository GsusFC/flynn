/**
 * HybridRenderer - Renderizador simplificado para Flynn Vector Grid
 */

import React from 'react';
import { VectorSvgRenderer } from '../../../vector/renderers/VectorSvgRenderer';

export const HybridRenderer: React.FC<any> = (props) => {
  // Simplificado - pasa todas las props al SVG renderer
  return <VectorSvgRenderer {...props} />;
};