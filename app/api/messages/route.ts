import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') ?? '50')

    const messages = await prisma.message.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(projectId && { projectId }),
      },
      include: {
        assets: true,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })
    return NextResponse.json({ data: messages })
  } catch (error) {
    console.error('[GET /api/messages]', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { role, content, clientId, projectId, metadata } = body

    if (!role || !content) {
      return NextResponse.json({ error: 'role and content are required' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        role,
        content,
        clientId: clientId || null,
        projectId: projectId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    // TODO: Phase 2 — dispatch to OpenAI orchestrator, get back classified jobs to create
    // const classified = await openAIOrchestrator.classifyCommand(content, { clientId, projectId })
    // await prisma.job.createMany({ data: classified.jobsToCreate.map(j => ({ ...j, status: 'queued' })) })

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/messages]', error)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}
