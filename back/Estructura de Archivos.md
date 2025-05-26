/src
├── app/                     # (Si usas Next.js App Router) Layouts y páginas de la aplicación.
│   └── (main)/              # Grupo de rutas para el layout principal
│       ├── layout.tsx
│       └── page.tsx         # Página que montaría, por ejemplo, VectorGridPlayground
│
├── components/
│   ├── ui/                  # Componentes de UI genéricos y reutilizables (de Shadcn o custom)
│   │   ├── Button.tsx
│   │   ├── Slider.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Label.tsx
│   │   ├── ScrollArea.tsx
│   │   ├── Card.tsx
│   │   └── index.ts         # Para exportar todos los componentes de UI
│   │
│   └── features/            # Módulos o "features" principales de tu aplicación
│       └── vector-grid/     # Módulo específico para toda la funcionalidad de VectorGrid
│           ├── components/  # Componentes React específicos de VectorGrid
│           │   ├── controls/
│           │   │   ├── LeftControlPanel.tsx
│           │   │   ├── RightControlPanel.tsx
│           │   │   ├── ControlSection.tsx    # Wrapper para secciones de controles
│           │   │   ├── SliderWithInput.tsx   # Componente especializado (ya existente)
│           │   │   └── ButtonGroup.tsx       # Componente especializado (ya existente)
│           │   ├── rendering/
│           │   │   ├── VectorGrid.tsx        # Lógica principal de la cuadrícula y renderizado
│           │   │   ├── VectorRenderer.tsx    # Orquesta el renderizador (SVG/Canvas)
│           │   │   ├── VectorSvgRenderer.tsx
│           │   │   └── VectorCanvasRenderer.tsx # (Si se decide mantener Canvas)
│           │   └── VectorGridPlayground.tsx  # Orquestador principal de la feature (antes examples)
│           │
│           ├── core/        # Lógica de negocio, tipos, constantes, no-React
│           │   ├── types.ts             # Definiciones de tipos (VectorGridProps, etc.)
│           │   ├── animations.ts        # Lógica y helpers de animación
│           │   ├── defaults.ts          # Valores por defecto de configuración
│           │   └── utils.ts             # Funciones de utilidad específicas
│           │
│           ├── store/       # Gestión de estado (Zustand) para VectorGrid
│           │   ├── vectorGridStore.ts   # Definición del store, estado, acciones
│           │   └── selectors.ts         # (Opcional) Selectores de Zustand
│           │
│           ├── hooks/       # Hooks personalizados para VectorGrid
│           │   ├── useGridDimensions.ts
│           │   └── useDebouncedEffect.ts # Hook genérico útil
│           │
│           └── index.ts     # Punto de entrada del módulo VectorGrid (exporta componentes principales)
│
├── constants/               # Constantes globales de la aplicación
│   └── index.ts
│
├── hooks/                   # Hooks globales y reutilizables en toda la aplicación
│   └── ...
│
├── lib/                     # Utilidades generales, configuraciones
│   ├── utils.ts             # Funciones de utilidad genéricas
│   └── cn.ts                # Para classnames (común con Shadcn)
│
├── styles/                  # Estilos globales
│   └── globals.css
│
└── types/                   # Tipos globales de la aplicación (si no son específicos de una feature)
    └── index.ts