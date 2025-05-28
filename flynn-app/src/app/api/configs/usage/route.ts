import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(request: NextRequest) {
  try {
    // Check if Vercel KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({
        totalPublicConfigs: 0,
        animationDistribution: {},
        lastUpdated: new Date().toISOString(),
        message: 'Public configurations require Vercel KV setup'
      });
    }

    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    // Get basic usage statistics
    const publicConfigIds: string[] = await kv.lrange('configs:public:index', 0, -1) || [];
    const totalPublicConfigs = publicConfigIds.length;

    // Get animation type distribution
    const animationTypes = [
      'wave', 'spiral', 'orbit', 'pulse', 'flow', 'geometric', 'seaWaves', 'geometricPattern'
    ];
    
    const animationDistribution: Record<string, number> = {};
    
    for (const type of animationTypes) {
      const typeConfigs: string[] = await kv.lrange(`configs:public:animation:${type}`, 0, -1) || [];
      animationDistribution[type] = typeConfigs.length;
    }

    const basicStats = {
      totalPublicConfigs,
      animationDistribution,
      lastUpdated: new Date().toISOString()
    };

    if (!detailed) {
      return NextResponse.json(basicStats);
    }

    // Get detailed statistics (only if requested)
    const configs: any[] = [];
    
    if (publicConfigIds.length > 0) {
      const pipeline = kv.pipeline();
      
      for (const id of publicConfigIds) {
        pipeline.hgetall(`config:${id}`);
      }
      
      const results = await pipeline.exec();
      
      for (let i = 0; i < results.length; i++) {
        const configData = results[i] as any;
        if (configData && configData.isPublic === 'true') {
          configs.push({
            id: configData.id,
            name: configData.name,
            createdAt: configData.createdAt,
            viewCount: parseInt(configData.viewCount || '0'),
            animationType: JSON.parse(configData.animationConfig || '{}').type
          });
        }
      }
    }

    // Calculate detailed metrics
    const totalViews = configs.reduce((sum, config) => sum + config.viewCount, 0);
    const avgViews = configs.length > 0 ? totalViews / configs.length : 0;
    
    // Most popular configurations
    const mostPopular = configs
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map(config => ({
        id: config.id,
        name: config.name,
        viewCount: config.viewCount,
        animationType: config.animationType
      }));

    // Recent activity (configs created in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentConfigs = configs.filter(config => 
      new Date(config.createdAt) > sevenDaysAgo
    ).length;

    // Daily creation stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyStats: Record<string, number> = {};
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayConfigs = configs.filter(config => {
        const configDate = config.createdAt.split('T')[0];
        return configDate === dateStr;
      }).length;
      
      dailyStats[dateStr] = dayConfigs;
    }

    const detailedStats = {
      ...basicStats,
      totalViews,
      averageViews: Math.round(avgViews * 100) / 100,
      mostPopular,
      recentConfigs,
      dailyCreationStats: dailyStats
    };

    return NextResponse.json(detailedStats);

  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}