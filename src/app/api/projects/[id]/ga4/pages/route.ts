import { NextRequest, NextResponse } from 'next/server';
import { Ga4PageRowDto, PaginatedList } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';

    let samplePages: Ga4PageRowDto[] = [
      {
        landingPage: '/',
        sessions: 18450,
        activeUsers: 14900,
        engagementRate: 0.684,
        conversions: 890,
        revenue: 16820.0,
      },
      {
        landingPage: '/features/team-tracking',
        sessions: 8920,
        activeUsers: 7210,
        engagementRate: 0.612,
        conversions: 410,
        revenue: 8200.0,
      },
      {
        landingPage: '/pricing',
        sessions: 6410,
        activeUsers: 5320,
        engagementRate: 0.745,
        conversions: 320,
        revenue: 6400.0,
      },
      {
        landingPage: '/blog/employee-monitoring-ethics',
        sessions: 4200,
        activeUsers: 3840,
        engagementRate: 0.521,
        conversions: 45,
        revenue: 900.0,
      },
      {
        landingPage: '/downloads',
        sessions: 3120,
        activeUsers: 2890,
        engagementRate: 0.792,
        conversions: 175,
        revenue: 2530.0,
      },
    ];

    if (search) {
      samplePages = samplePages.filter((p) => p.landingPage.toLowerCase().includes(search));
    }

    const data: PaginatedList<Ga4PageRowDto> = {
      items: samplePages,
      totalCount: samplePages.length,
      pageNumber: 1,
      pageSize: 50,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    return NextResponse.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        message: error?.message || 'Failed to fetch GA4 pages',
      },
      { status: 500 }
    );
  }
}
