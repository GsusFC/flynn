# Sistema de Configuraciones Guardadas - Guía de Configuración

## Configuración de Vercel KV

Para habilitar las configuraciones públicas compartidas, necesitas configurar Vercel KV:

### 1. Crear un KV Store en Vercel

1. Ve a tu dashboard de Vercel: https://vercel.com/dashboard/stores
2. Haz clic en "Create Database" → "KV"
3. Dale un nombre a tu store (ej: `flynn-vector-grid-configs`)
4. Selecciona tu región preferida

### 2. Obtener las credenciales

Una vez creado el KV store:

1. Ve a la pestaña "Settings" de tu KV store
2. Copia las variables de entorno:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### 3. Configurar variables de entorno

#### Para desarrollo local:
1. Crea o edita `flynn-app/.env.local`
2. Agrega las variables copiadas:
```bash
KV_REST_API_URL="https://your-kv-store.kv.vercel-storage.com"
KV_REST_API_TOKEN="your_secret_token_here"
```

#### Para producción:
1. Ve a tu proyecto en Vercel dashboard
2. Settings → Environment Variables
3. Agrega las dos variables de entorno

### 4. Verificar la instalación

1. Ejecuta `cd flynn-app && npm install @vercel/kv`
2. Reinicia tu servidor de desarrollo
3. Prueba guardando una configuración pública

## Funcionalidades del Sistema

### Configuraciones Privadas
- Se guardan en localStorage del navegador
- Solo visibles para el usuario actual
- No requieren configuración adicional

### Configuraciones Públicas
- Se guardan en Vercel KV
- Compartibles mediante URL
- Requieren configuración de Vercel KV

### Características principales:
- Guardar/cargar configuraciones completas (grid, vectores, animación, zoom)
- Sistema de tags para organización
- Filtros por tipo de animación
- Búsqueda por nombre/descripción/tags
- Contador de visualizaciones para configs públicas
- Links compartibles para configs públicas

## API Endpoints

- `POST /api/configs/save` - Guardar configuración pública
- `GET /api/configs/public` - Listar configuraciones públicas (con filtros)
- `GET /api/configs/[id]` - Obtener configuración específica
- `DELETE /api/configs/[id]` - Eliminar configuración pública
- `GET /api/configs/usage` - Estadísticas de uso

## Próximos pasos

1. Configurar Vercel KV siguiendo los pasos anteriores
2. Probar guardando una configuración privada
3. Probar guardando una configuración pública
4. Verificar que los filtros y búsqueda funcionen correctamente