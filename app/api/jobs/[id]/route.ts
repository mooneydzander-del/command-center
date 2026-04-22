import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, result, errorMsg, agentId, currentTask } = body

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(result && { result: JSON.stringify(result) }),
        ...(errorMsg && { errorMsg }),
        ...(agentId && { agentId }),
        ...(status === 'completed' || status === 'deployed' ? { completedAt: new Date() } : {}),
      },
    })

    // Update agent currentTask if provided
    if (agentId && currentTask !== undefined) {
      await prisma.agent.update({
        where: { id: agentId },
        data: { currentTask, lastHeartbeat: new Date() },
      })
    }

    return NextResponse.json({ data: updatedJob })
  } catch (error) {
    console.error('[PATCH /api/jobs/[id]]', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}
