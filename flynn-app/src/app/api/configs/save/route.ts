import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { SavedAnimation } from '@/components/features/vector-grid/simple/simpleTypes';

export async function POST(request: NextRequest) {
  try {
    // Check if Vercel KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json(
        { error: 'Public configurations require Vercel KV setup' },
        { status: 503 }
      );
    }

    const config: SavedAnimation = await request.json();
    
    // Validar que sea una configuración pública
    if (!config.isPublic) {
      return NextResponse.json(
        { error: 'Only public configurations can be saved to server' },
        { status: 400 }
      );
    }
    
    // Generar ID único para compartir si no existe
    if (!config.id) {
      config.id = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    
    // Establecer metadata de servidor
    config.createdAt = new Date().toISOString();
    config.updatedAt = new Date().toISOString();
    config.viewCount = 0;
    
    // Guardar en Vercel KV
    await kv.set(`config:${config.id}`, config);
    
    // Añadir a índice de configuraciones públicas
    const publicIndex = await kv.get<string[]>('configs:public:index') || [];
    if (!publicIndex.includes(config.id)) {
      publicIndex.unshift(config.id); // Más recientes primero
      await kv.set('configs:public:index', publicIndex);
    }
    
    // Índice por tipo de animación para filtros
    const typeIndex = await kv.get<string[]>(`configs:public:animation:${config.animationConfig.type}`) || [];
    if (!typeIndex.includes(config.id)) {
      typeIndex.unshift(config.id);
      await kv.set(`configs:public:animation:${config.animationConfig.type}`, typeIndex);
    }
    
    return NextResponse.json({
      success: true,
      id: config.id,
      config: config
    });
    
  } catch (error) {
    console.error('Error saving public config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}