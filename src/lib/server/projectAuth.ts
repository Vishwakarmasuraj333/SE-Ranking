/**
 * Server-side Project Authentication & Authorization Middleware
 * Verifies authenticated session, project existence, and project ownership
 */

import { NextRequest, NextResponse } from 'next/server';
import { Project, SearchEngineConfig } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getAuthSession, getSessionFromCookie } from './auth';

export interface VerifiedProjectAccess {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  };
  project: Project & { searchEngines?: SearchEngineConfig[] };
}

export type ProjectAuthResult =
  | { success: true; data: VerifiedProjectAccess; error?: never }
  | { success: false; error: NextResponse; data?: never };

/**
 * Validates request authentication and project ownership.
 * Returns either `{ success: true, data: { user, project } }` or `{ success: false, error: NextResponse }`.
 */
export async function verifyProjectAccess(
  req: NextRequest,
  projectIdOrDomain: string
): Promise<ProjectAuthResult> {
  try {
    // 1. Authenticate user from session cookie or header
    let auth = await getAuthSession(req);
    if (!auth) {
      auth = await getSessionFromCookie();
    }

    if (!auth || !auth.user) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Authentication required. Please sign in.',
            code: 'UNAUTHORIZED',
          },
          { status: 401 }
        ),
      };
    }

    const { user } = auth;

    // 2. Lookup project by ID or domain
    const cleanId = decodeURIComponent(projectIdOrDomain || '').trim();
    if (!cleanId) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Project ID is required.', code: 'INVALID_PROJECT_ID' },
          { status: 400 }
        ),
      };
    }

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id: cleanId }, { domain: cleanId }],
        deletedAt: null,
      },
      include: {
        searchEngines: true,
      },
    });

    if (!project) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Project not found.', code: 'PROJECT_NOT_FOUND' },
          { status: 404 }
        ),
      };
    }

    // 3. Check ownership / authorization
    // If project has no owner, claim ownership for current user
    if (!project.userId) {
      await prisma.project.update({
        where: { id: project.id },
        data: { userId: user.id },
      });
      project.userId = user.id;
    } else if (project.userId !== user.id && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Forbidden: You do not have permission to access this project.',
            code: 'FORBIDDEN',
          },
          { status: 403 }
        ),
      };
    }

    return {
      success: true,
      data: {
        user,
        project,
      },
    };
  } catch (err: unknown) {
    console.error('verifyProjectAccess error:', err);
    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Internal authorization error.',
          code: 'AUTH_ERROR',
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Verifies that a sub-resource belongs to the specified project ID.
 */
export function verifyResourceBelongsToProject(
  resourceProjectId: string | null | undefined,
  expectedProjectId: string
): boolean {
  if (!resourceProjectId || !expectedProjectId) return false;
  return resourceProjectId === expectedProjectId;
}
