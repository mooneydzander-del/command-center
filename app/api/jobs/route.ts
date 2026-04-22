import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')

    const jobs = await prisma.job.findMany({
      where: {
        ...(status && { status }),
        ...(projectId && { projectId }),
      },
      include: {
        project: { select: { name: true, client: { select: { name: true } } } },
        agent: { select: { name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ data: jobs })
  } catch (error) {
    console.error('[GET /api/jobs]', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, type, projectId, description, payload, priority } = body

    if (!title || !type) {
      return NextResponse.json({ error: 'title and type are required' }, { status: 400 })
    }

    const job = await prisma.job.create({
      data: {
        title,
        type,
        projectId,
        description,
        payload: payload ? JSON.stringify(payload) : null,
        priority: priority ?? 0,
        status: 'queued',
      },
    })
    return NextResponse.json({ data: job }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/jobs]', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
