import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [
      activeClients,
      activeProjects,
      jobCounts,
      agentsOnline,
      recentMessages,
      recentWorkflowRuns,
      recentDeployments,
    ] = await Promise.all([
      prisma.client.count({ where: { status: 'active' } }),
      prisma.project.count({ where: { status: { in: ['planning', 'in_progress', 'review'] } } }),
      prisma.job.groupBy({ by: ['status'], _count: true }),
      prisma.agent.count({ where: { status: { in: ['online', 'busy'] } } }),
      prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { assets: true } }),
      prisma.workflowRun.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.deployment.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { project: { select: { name: true } } } }),
    ])

    const jobsByStatus = jobCounts.reduce((acc, row) => {
      acc[row.status] = row._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      data: {
        activeClients,
        activeProjects,
        jobsByStatus,
        agentsOnline,
        recentMessages,
        recentWorkflowRuns,
        recentDeployments,
      },
    })
  } catch (error) {
    console.error('[GET /api/dashboard]', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 })
  }
}
