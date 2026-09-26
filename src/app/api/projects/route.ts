import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ProjectSchema } from '@/lib/validation/schemas';

export async function GET() {
  try {
    let projects = await prisma.project.findMany({
      where: { isArchived: false },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { analyses: true },
        },
      },
    });

    // Seed default zoho project if none exist, matching user's exact screenshot
    if (projects.length === 0) {
      const defaultProj = await prisma.project.create({
        data: {
          name: 'zohosocial.com',
          domain: 'zohosocial.com',
          brandName: 'Zoho',
          country: 'India',
          countryCode: 'in',
        },
        include: {
          _count: {
            select: { analyses: true },
          },
        },
      });
      projects = [defaultProj];
    }

    const formatted = projects.map((p) => ({
      id: p.id,
      name: p.name,
      domain: p.domain,
      brandName: p.brandName,
      country: p.country,
      countryCode: p.countryCode,
      isArchived: p.isArchived,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      analysesCount: p._count.analyses,
    }));

    return NextResponse.json({ success: true, projects: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch projects.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = ProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid project data.' },
        { status: 400 }
      );
    }

    const { name, domain, brandName, country, countryCode } = result.data;

    const existing = await prisma.project.findFirst({
      where: { domain },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A project with this domain already exists.' },
        { status: 409 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        domain,
        brandName: brandName || null,
        country: country || 'India',
        countryCode: countryCode || 'in',
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
