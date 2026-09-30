import { NextResponse } from 'next/server';
import { GlobalDashboardDto, GlobalDashboardProjectSummaryDto } from '@/lib/types';

export async function GET() {
  try {
    const projects: GlobalDashboardProjectSummaryDto[] = [
      {
        projectId: 'proj-123',
        name: 'WorkComposer Enterprise',
        primaryDomain: 'workcomposer.com',
        healthScore: 88,
        trackedKeywords: 450,
        openTasks: 5,
        overdueTasks: 1,
        gscSyncStatus: 'Active',
      },
      {
        projectId: 'proj-124',
        name: 'Time Doctor Competitor',
        primaryDomain: 'timedoctor.com',
        healthScore: 76,
        trackedKeywords: 320,
        openTasks: 2,
        overdueTasks: 0,
        gscSyncStatus: 'Active',
      },
      {
        projectId: 'proj-125',
        name: 'Hubstaff Tracker',
        primaryDomain: 'hubstaff.com',
        healthScore: 42,
        trackedKeywords: 180,
        openTasks: 8,
        overdueTasks: 3,
        gscSyncStatus: 'Inactive',
      },
    ];

    const data: GlobalDashboardDto = {
      totalProjects: projects.length,
      totalTrackedKeywords: projects.reduce((acc, p) => acc + p.trackedKeywords, 0),
      averageHealthScore: Math.round(
        projects.reduce((acc, p) => acc + (p.healthScore || 0), 0) / projects.length
      ),
      totalOpenTasks: projects.reduce((acc, p) => acc + p.openTasks, 0),
      totalOverdueTasks: projects.reduce((acc, p) => acc + p.overdueTasks, 0),
      projects,
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
        message: error?.message || 'Failed to fetch global dashboard',
      },
      { status: 500 }
    );
  }
}
