import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const workers = await prisma.agent.findMany({
      include: {
        _count: { select: { jobs: true } },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ data: workers })
  } catch (error) {
    console.error('[GET /api/workers]', error)
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 })
  }
}

// Heartbeat — workers call this to report status
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, type, status, currentTask, errorState } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }

    const worker = await prisma.agent.upsert({
      where: { id },
      update: {
        status,
        currentTask: currentTask ?? null,
        errorState: errorState ?? null,
        lastHeartbeat: new Date(),
      },
      create: {
        id,
        name: name ?? id,
        type: type ?? 'claude_worker',
        status,
        currentTask: currentTask ?? null,
        lastHeartbeat: new Date(),
      },
    })
    return NextResponse.json({ data: worker })
  } catch (error) {
    console.error('[POST /api/workers]', error)
    return NextResponse.json({ error: 'Failed to update worker' }, { status: 500 })
  }
}
