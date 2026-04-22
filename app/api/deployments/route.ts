import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const environment = searchParams.get('environment')
    const approvalState = searchParams.get('approvalState')
    const limit = parseInt(searchParams.get('limit') ?? '50')

    const deployments = await prisma.deployment.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(environment && { environment }),
        ...(approvalState && { approvalState }),
      },
      include: {
        project: {
          select: { name: true, client: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return NextResponse.json({ data: deployments })
  } catch (error) {
    console.error('[GET /api/deployments]', error)
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId, environment, commitSha } = body

    if (!projectId || !environment) {
      return NextResponse.json({ error: 'projectId and environment are required' }, { status: 400 })
    }

    // Production requires approval — preview does not
    const approvalState = environment === 'production' ? 'pending' : 'not_required'

    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        environment,
        status: 'pending',
        approvalState,
        commitSha: commitSha ?? null,
      },
    })
    return NextResponse.json({ data: deployment }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/deployments]', error)
    return NextResponse.json({ error: 'Failed to create deployment' }, { status: 500 })
  }
}
