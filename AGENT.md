# Flynn Vector Grid - Agent Memory

## Comandos Frecuentes
- **Dev server**: `cd flynn-app && npm run dev` (puerto 3000 o siguiente disponible)
- **Build**: `cd flynn-app && npm run build`
- **Lint**: `cd flynn-app && npm run lint`

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