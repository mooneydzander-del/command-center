import { prisma } from '@/lib/db'
import { CommandCenterView } from '@/components/command/CommandCenterView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CommandPage() {
  // Load initial data server-side
  const [messages, clients, projects] = await Promise.all([
    prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: { assets: true },
    }),
    prisma.client.findMany({
      where: { status: { in: ['active', 'prospect'] } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.project.findMany({
      where: { status: { notIn: ['completed', 'deployed', 'paused'] } },
      select: { id: true, name: true, clientId: true },
      orderBy: { name: 'asc' },
    }),
  ])

  // Recent jobs for sidebar
  const recentJobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { project: { select: { name: true } } },
  })

  const typedMessages = messages.map(m => ({
    ...m,
    role: m.role as 'user' | 'assistant' | 'system',
    assets: m.assets.map(a => ({ name: a.name, type: a.type, url: a.url })),
  }))

  return (
    <CommandCenterView
      initialMessages={typedMessages}
      clients={clients}
      projects={projects}
      recentJobs={recentJobs}
    />
  )
}
