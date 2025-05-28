import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { ConfigFilters, SavedAnimation } from '@/components/features/vector-grid/simple/simpleTypes';

export async function GET(request: NextRequest) {
  try {
    // Check if Vercel KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({
        configs: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
        message: 'Public configurations require Vercel KV setup'
      });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const animationType = searchParams.get('animationType');
    const sortBy = searchParams.get('sortBy') as 'newest' | 'oldest' | 'mostViewed' | undefined;
    const search = searchParams.get('search');

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Get public config IDs from index
    const publicConfigIds: string[] = await kv.lrange('configs:public:index', 0, -1) || [];
    
    if (publicConfigIds.length === 0) {
      return NextResponse.json({
        configs: [],
        total: 0,
        page,
        totalPages: 0,
        hasMore: false
      });
    }

    // Fetch all public configs
    const configs: SavedAnimation[] = [];
    const pipeline = kv.pipeline();
    
    for (const id of publicConfigIds) {
      pipeline.hgetall(`config:${id}`);
    }
    
    const results = await pipeline.exec();
    
    for (let i = 0; i < results.length; i++) {
      const configData = results[i] as any;
      if (configData && configData.isPublic === 'true') {
        try {
          configs.push({
            id: configData.id,
            name: configData.name,
            description: configData.description || '',
            gridConfig: JSON.parse(configData.gridConfig),
            vectorConfig: JSON.parse(configData.vectorConfig),
            animationConfig: JSON.parse(configData.animationConfig),
            zoomConfig: JSON.parse(configData.zoomConfig),
            isPublic: true,
            createdAt: configData.createdAt,
            updatedAt: configData.updatedAt,
            viewCount: parseInt(configData.viewCount || '0'),
            tags: configData.tags ? JSON.parse(configData.tags) : []
          });
        } catch (error) {
          console.error(`Failed to parse config ${configData.id}:`, error);
        }
      }
    }

    // Apply filters
    let filteredConfigs = configs;

    // Filter by animation type
    if (animationType) {
      filteredConfigs = filteredConfigs.filter(config => 
        config.animationConfig.type === animationType
      );
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredConfigs = filteredConfigs.filter(config =>
        config.name.toLowerCase().includes(searchLower) ||
        config.description.toLowerCase().includes(searchLower) ||
        config.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort results
    switch (sortBy) {
      case 'oldest':
        filteredConfigs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'mostViewed':
        filteredConfigs.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'newest':
      default:
        filteredConfigs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Paginate results
    const total = filteredConfigs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedConfigs = filteredConfigs.slice(startIndex, endIndex);

    return NextResponse.json({
      configs: paginatedConfigs,
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    });

  } catch (error) {
    console.error('Error fetching public configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configurations' },
      { status: 500 }
    );
  }
}