import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    let brands = await (prisma as any).socialBrand.findMany({
      orderBy: { createdAt: 'desc' },
      include: { posts: true },
    }).catch(() => []);

    if (brands.length === 0) {
      // Seed default workspace brands
      const sampleBrands = [
        {
          name: 'WorkComposer Global',
          workspaceName: 'WorkComposer Agency',
          platforms: JSON.stringify(['Facebook', 'Instagram', 'LinkedIn', 'YouTube', 'X (Twitter)']),
          workspacesCount: 3,
          postsCount: 24,
          status: 'Active',
        },
        {
          name: 'SaaS Growth Hub',
          workspaceName: 'Growth Labs',
          platforms: JSON.stringify(['LinkedIn', 'X (Twitter)', 'Threads']),
          workspacesCount: 1,
          postsCount: 12,
          status: 'Active',
        },
      ];

      for (const b of sampleBrands) {
        await (prisma as any).socialBrand.create({ data: b }).catch(() => null);
      }

      brands = await (prisma as any).socialBrand.findMany({
        orderBy: { createdAt: 'desc' },
        include: { posts: true },
      }).catch(() => []);
    }

    return NextResponse.json({
      success: true,
      brands: brands.map((b: any) => ({
        id: b.id,
        name: b.name,
        workspaceName: b.workspaceName || 'Default Workspace',
        platforms: typeof b.platforms === 'string' ? JSON.parse(b.platforms) : b.platforms,
        postsCount: b.postsCount || 0,
        workspacesCount: b.workspacesCount || 1,
        status: b.status,
        createdAt: b.createdAt,
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve social brands';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body.name || 'New Social Brand';
    const workspaceName = body.workspaceName || `${name} Workspace`;
    const platforms = Array.isArray(body.platforms) ? body.platforms : ['Instagram', 'LinkedIn'];

    const newBrand = await (prisma as any).socialBrand.create({
      data: {
        name,
        workspaceName,
        platforms: JSON.stringify(platforms),
        workspacesCount: 1,
        postsCount: 0,
        status: 'Active',
      },
    });

    return NextResponse.json({
      success: true,
      brand: {
        id: newBrand.id,
        name: newBrand.name,
        workspaceName: newBrand.workspaceName,
        platforms,
        postsCount: 0,
        status: newBrand.status,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create social brand';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.id) {
      await (prisma as any).socialBrand.delete({ where: { id: body.id } }).catch(() => null);
    }
    return NextResponse.json({ success: true, message: 'Brand deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete brand';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
