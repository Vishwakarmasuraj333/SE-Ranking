import { NextRequest, NextResponse } from 'next/server';

export interface ReportBuilderConfig {
  headerLogo: string | null;
  companyName: string;
  headerColor: string;
  customHeaderColor: string;
  headerTextColor: string;
  coverPageLogo: string | null;
  coverPageBackground: string | null;
  coverPageTextColor: string;
  orientation: 'portrait' | 'landscape';
  updatedAt: string;
}

const DEFAULT_CONFIG: ReportBuilderConfig = {
  headerLogo: null,
  companyName: 'SE Ranking',
  headerColor: '#1976D2',
  customHeaderColor: '1976D2',
  headerTextColor: 'FFFFFF',
  coverPageLogo: 'default_se_ranking',
  coverPageBackground: null,
  coverPageTextColor: '232A32',
  orientation: 'portrait',
  updatedAt: new Date().toISOString(),
};

let currentConfig: ReportBuilderConfig = { ...DEFAULT_CONFIG };

export async function GET() {
  return NextResponse.json({
    success: true,
    data: currentConfig,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    currentConfig = {
      ...currentConfig,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Report Builder settings successfully applied!',
      data: currentConfig,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT() {
  currentConfig = {
    ...DEFAULT_CONFIG,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    message: 'Report Builder settings reset to default.',
    data: currentConfig,
  });
}
