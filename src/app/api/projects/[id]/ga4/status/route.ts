import { NextRequest, NextResponse } from 'next/server';
import { Ga4ConnectionDto } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;

    const data: Ga4ConnectionDto = {
      propertyIdentifier: 'properties/318492041',
      syncStatus: 'Active',
      lastSyncedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
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
        message: error?.message || 'Failed to fetch GA4 status',
      },
      { status: 500 }
    );
  }
}
