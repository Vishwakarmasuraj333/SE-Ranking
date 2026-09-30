import { NextRequest, NextResponse } from 'next/server';
import { Ga4OverviewDto } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;

    const sampleDaily = [
      { date: '2026-09-12', sessions: 1420, activeUsers: 1190 },
      { date: '2026-09-13', sessions: 1380, activeUsers: 1150 },
      { date: '2026-09-14', sessions: 1650, activeUsers: 1390 },
      { date: '2026-09-15', sessions: 1820, activeUsers: 1540 },
      { date: '2026-09-16', sessions: 1790, activeUsers: 1480 },
      { date: '2026-09-17', sessions: 1910, activeUsers: 1620 },
      { date: '2026-09-18', sessions: 1880, activeUsers: 1590 },
    ];

    const data: Ga4OverviewDto = {
      totalSessions: 48920,
      totalActiveUsers: 39410,
      averageEngagementRate: 0.6482,
      totalConversions: 1840,
      totalRevenue: 34850.0,
      dailySeries: sampleDaily,
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
        message: error?.message || 'Failed to fetch GA4 overview',
      },
      { status: 500 }
    );
  }
}
