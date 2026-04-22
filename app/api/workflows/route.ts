import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { n8nAdapter } from '@/services/n8n'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') ?? '50')

    const runs = await prisma.workflowRun.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(projectId && { projectId }),
      },
      include: {
        client: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return NextResponse.json({ data: runs })
  } catch (error) {
    console.error('[GET /api/workflows]', error)
    return NextResponse.json({ error: 'Failed to fetch workflow runs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { templateName, clientId, projectId, webhookPath } = body

    if (!templateName) {
      return NextResponse.json({ error: 'templateName is required' }, { status: 400 })
    }

    // Create workflow run record first
    const run = await prisma.workflowRun.create({
      data: {
        templateName,
        status: 'pending',
        clientId: clientId ?? null,
        projectId: projectId ?? null,
        startedAt: new Date(),
      },
    })

    // Trigger in n8n
    try {
      const { runId } = await n8nAdapter.triggerWorkflow(templateName, {
        commandCenterId: run.id,
        clientId,
        projectId,
        webhookPath,
      })
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: { status: 'running', n8nRunId: runId },
      })
    } catch (triggerErr) {
      console.error('[n8n trigger failed]', triggerErr)
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: { status: 'failed', logsJson: JSON.stringify({ error: String(triggerErr) }) },
      })
    }

    return NextResponse.json({ data: run }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/workflows]', error)
    return NextResponse.json({ error: 'Failed to trigger workflow' }, { status: 500 })
  }
}
