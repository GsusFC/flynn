# Flynn Vector Grid - Agent Memory

## Comandos Frecuentes
- **Dev server**: `cd flynn-app && npm run dev` (puerto 3000 o siguiente disponible)
- **Build**: `cd flynn-app && npm run build`
- **Lint**: `cd flynn-app && npm run lint`

## Cambios Recientes (Enero 2025)
- **FlynVectorGrid v2 CREADO**: Nueva versión usando useFlynnHook como cerebro estable
- **useSimpleVectorGridOptimized DEPRECADO**: Hook roto marcado como deprecated
- **Sistema unificado**: FlynVectorGrid v2 + useFlynnHook sin loops infinitos
- **Página v2-test**: `/v2-test` para probar nueva arquitectura
- **Backward compatibility**: FlynVectorGrid v2 mantiene interfaz compatible
- **Manual controls**: Solo controles manuales (rotate, pulse, reset) - no animaciones automáticas

## Arquitectura del Proyecto

### Estructura Principal
- `flynn-app/` - Aplicación Next.js principal
- `back/` - Documentación y stores auxiliares
- Vector grid con renderizado híbrido SVG/Canvas (>300 vectores → Canvas automático)

### Componentes Clave
- `SimpleVectorGrid` - Básico, solo SVG
- `SimpleVectorGridOptimized` - Híbrido con monitor de performance
- Sistema de animaciones modular en `flynn-app/src/components/features/vector-grid/simple/animations/`

## Problemas Identificados y Solucionados

### Animaciones con Props Faltantes
- **seaWaves**: Faltaba `spatialFactor` en tipos y conversión legacy
- **geometricPattern**: Faltaba `patternIntensity` en tipos y conversión legacy
- **Solución**: Agregar props faltantes a `simpleTypes.ts` y `page.tsx`

### Sistema de Colores HSL Problemático
**Problema**: `hslRainbow` y `hslGradientFlow` están implementadas como animaciones cuando deberían ser opciones de color independientes.

**Consecuencias**:
- Los colores se "pegan" al cambiar de animación
- No se pueden combinar animaciones de movimiento con efectos de color
- Mezcla de responsabilidades (movimiento + color)

### Plan de Refactoring Pendiente
**Estado**: Analizado, no implementado aún
**Objetivo**: Separar sistema de animaciones (movimiento) del sistema de colores
**Beneficios**: HSL picker unificado, gradientes personalizables, mejor UX

### ⚠️ Problema Crítico - Loop de Animación Roto (Enero 2025)
**Síntoma**: Los vectores se ven pero no se mueven automáticamente con el tiempo
**Estado**: Detectado, no resuelto
**Causa**: Loop de animación no funciona correctamente
- requestAnimationFrame se ejecuta
- isPaused = false
- Botón pause/play responde pero animaciones no corren
- Vectores sí responden a cambios manuales de controles
**Nota**: Revisar useSimpleVectorGridOptimized.ts líneas 270-285

## Configuración del Usuario
- Prefiere 50x50 vectores (2500 vectores) para pruebas de alta densidad
- Utiliza modo debug activado (`debugMode = true` en page.tsx línea 48)
- Testea principalmente con animaciones complejas (olas, patrones geométricos)

## Notas Técnicas
- TypeScript estricto habilitado
- ESLint con reglas de React
- Tailwind CSS para estilos
- Sistema de tipos modular para animaciones
- Performance monitoring automático para rendering