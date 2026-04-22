import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        _count: { select: { jobs: true } },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: agents })
  } catch (error) {
    console.error('[GET /api/agents]', error)
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
  }
}

// Heartbeat endpoint — agents call this to report status
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, status, currentTask, errorState } = body

    const agent = await prisma.agent.upsert({
      where: { id },
      update: {
        status,
        currentTask: currentTask ?? null,
        errorState: errorState ?? null,
        lastHeartbeat: new Date(),
      },
      create: {
        id,
        name: body.name ?? id,
        type: body.type ?? 'openclaw',
        status,
        currentTask: currentTask ?? null,
        lastHeartbeat: new Date(),
      },
    })
    return NextResponse.json({ data: agent })
  } catch (error) {
    console.error('[POST /api/agents]', error)
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 })
  }
}
