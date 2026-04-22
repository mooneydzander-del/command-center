import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { openAIOrchestrator } from '@/services/openai'
import { claudeWorkerAdapter } from '@/services/claude-worker'

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
      include: { assets: true },
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

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        role,
        content,
        clientId: clientId ?? null,
        projectId: projectId ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })

    // Only orchestrate on user commands
    if (role !== 'user') {
      return NextResponse.json({ data: { message: userMessage, jobs: [], orchestratorReply: null } }, { status: 201 })
    }

    // Fetch client/project names for context
    const [client, project] = await Promise.all([
      clientId ? prisma.client.findUnique({ where: { id: clientId }, select: { name: true } }) : null,
      projectId ? prisma.project.findUnique({ where: { id: projectId }, select: { name: true } }) : null,
    ])

    // Fetch recent message history for context
    const history = await prisma.message.findMany({
      where: { ...(clientId && { clientId }), ...(projectId && { projectId }) },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { role: true, content: true },
    })

    // Run through OpenAI orchestrator
    const classified = await openAIOrchestrator.classifyCommand(content, {
      clientId: clientId ?? undefined,
      projectId: projectId ?? undefined,
      clientName: client?.name,
      projectName: project?.name,
      history: history.reverse(),
    })

    // Create jobs in DB
    const createdJobs = await Promise.all(
      classified.jobsToCreate.map(jobSpec =>
        prisma.job.create({
          data: {
            title: jobSpec.title,
            type: jobSpec.type,
            description: jobSpec.description,
            status: 'queued',
            priority: jobSpec.priority,
            projectId: classified.projectId ?? projectId ?? null,
            payload: JSON.stringify({ sourceMessageId: userMessage.id, command: content }),
          },
        })
      )
    )

    // Notify Claude Worker of new jobs
    await Promise.allSettled(
      createdJobs.map(job =>
        claudeWorkerAdapter.submitJob({
          jobId: job.id,
          title: job.title,
          type: job.type,
          description: job.description ?? undefined,
          projectId: job.projectId ?? undefined,
          clientId: clientId ?? undefined,
        })
      )
    )

    // Save orchestrator response as assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        role: 'assistant',
        content: classified.response,
        clientId: clientId ?? null,
        projectId: projectId ?? null,
        metadata: JSON.stringify({
          intent: classified.intent,
          jobIds: createdJobs.map(j => j.id),
        }),
      },
    })

    return NextResponse.json({
      data: {
        message: userMessage,
        assistantMessage,
        jobs: createdJobs,
        intent: classified.intent,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/messages]', error)
    return NextResponse.json({ error: 'Failed to process command' }, { status: 500 })
  }
}
