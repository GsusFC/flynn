import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { SavedAnimation } from '@/components/features/vector-grid/simple/simpleTypes';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check if Vercel KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json(
        { error: 'Public configurations require Vercel KV setup' },
        { status: 503 }
      );
    }

    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid configuration ID' },
        { status: 400 }
      );
    }

    // Get configuration from KV
    const configData = await kv.hgetall(`config:${id}`);

    if (!configData || !configData.id) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Check if configuration is public
    if (configData.isPublic !== 'true') {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    try {
      // Parse the configuration
      const config: SavedAnimation = {
        id: configData.id as string,
        name: configData.name as string,
        description: (configData.description as string) || '',
        gridConfig: JSON.parse(configData.gridConfig as string),
        vectorConfig: JSON.parse(configData.vectorConfig as string),
        animationConfig: JSON.parse(configData.animationConfig as string),
        zoomConfig: JSON.parse(configData.zoomConfig as string),
        isPublic: true,
        createdAt: configData.createdAt as string,
        updatedAt: configData.updatedAt as string,
        viewCount: parseInt((configData.viewCount as string) || '0'),
        tags: configData.tags ? JSON.parse(configData.tags as string) : []
      };

      // Increment view count
      await kv.hincrby(`config:${id}`, 'viewCount', 1);

      return NextResponse.json(config);

    } catch (parseError) {
      console.error('Error parsing configuration data:', parseError);
      return NextResponse.json(
        { error: 'Invalid configuration data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error fetching configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check if Vercel KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json(
        { error: 'Public configurations require Vercel KV setup' },
        { status: 503 }
      );
    }

    const { id } = await context.params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid configuration ID' },
        { status: 400 }
      );
    }

    // Get configuration to check if it exists and is public
    const configData = await kv.hgetall(`config:${id}`);

    if (!configData || !configData.id) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    if (configData.isPublic !== 'true') {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Note: In a real application, you'd want to implement proper authentication
    // and authorization here to ensure only the owner can delete their configurations

    // Remove from public index
    await kv.lrem('configs:public:index', 0, id);

    // Remove animation type index
    if (configData.animationConfig) {
      try {
        const animationConfig = JSON.parse(configData.animationConfig as string);
        await kv.lrem(`configs:public:animation:${animationConfig.type}`, 0, id);
      } catch (error) {
        console.error('Error removing from animation index:', error);
      }
    }

    // Delete the configuration
    await kv.del(`config:${id}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting configuration:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration' },
      { status: 500 }
    );
  }
}