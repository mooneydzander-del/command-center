import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        jobs: { orderBy: { createdAt: 'desc' }, include: { agent: { select: { name: true } } } },
        assets: { orderBy: { createdAt: 'desc' } },
        deployments: { orderBy: { createdAt: 'desc' } },
        workflowRuns: { orderBy: { createdAt: 'desc' } },
        messages: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    return NextResponse.json({ data: project })
  } catch (error) {
    console.error('[GET /api/projects/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, status, description, previewUrl, productionUrl } = body

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(previewUrl !== undefined && { previewUrl }),
        ...(productionUrl !== undefined && { productionUrl }),
      },
    })
    return NextResponse.json({ data: project })
  } catch (error) {
    console.error('[PATCH /api/projects/[id]]', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}
