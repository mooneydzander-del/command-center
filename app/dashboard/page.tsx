import { prisma } from '@/lib/db'
import {
  Users, FolderOpen, Briefcase, Bot, Terminal, Rocket, GitBranch, AlertCircle,
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ActivityFeed, type ActivityItem } from '@/components/dashboard/ActivityFeed'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge, jobStatusVariant, agentStatusVariant } from '@/components/ui/Badge'
import { StatusDot } from '@/components/ui/Badge'
import { formatRelative } from '@/lib/utils'
import type { JobStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDashboardData() {
  const [
    activeClients,
    activeProjects,
    jobGroups,
    workers,
    recentMessages,
    recentJobs,
    workersOnline,
  ] = await Promise.all([
    prisma.client.count({ where: { status: 'active' } }),
    prisma.project.count({ where: { status: { in: ['planning', 'in_progress', 'review'] } } }),
    prisma.job.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.agent.findMany({ orderBy: { lastHeartbeat: 'desc' } }),
    prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { assets: false },
    }),
    prisma.job.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { project: { select: { name: true, client: { select: { name: true } } } } },
    }),
    prisma.agent.count({ where: { status: { in: ['online', 'busy'] } } }),
  ])

  const jobsByStatus = jobGroups.reduce((acc, row) => {
    acc[row.status as JobStatus] = row._count.id
    return acc
  }, {} as Record<string, number>)

  return { activeClients, activeProjects, jobsByStatus, workers, recentMessages, recentJobs, workersOnline }
}

export default async function DashboardPage() {
  const { activeClients, activeProjects, jobsByStatus, workers, recentMessages, recentJobs, workersOnline } =
    await getDashboardData()

  const totalQueued = (jobsByStatus['queued'] ?? 0) + (jobsByStatus['running'] ?? 0)
  const totalFailed = jobsByStatus['failed'] ?? 0
  const totalCompleted = jobsByStatus['completed'] ?? 0

  const activityItems: ActivityItem[] = recentMessages.map(m => ({
    id: m.id,
    type: m.role === 'user' ? ('message' as const) : ('message' as const),
    title: m.content.length > 80 ? m.content.slice(0, 80) + '…' : m.content,
    timestamp: m.createdAt,
  }))

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-xl text-cream">Good morning.</h2>
        <p className="text-xs text-muted mt-0.5">Here&apos;s what&apos;s happening across your agency.</p>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Clients"
          value={activeClients}
          icon={<Users className="w-3.5 h-3.5" />}
        />
        <MetricCard
          label="Active Projects"
          value={activeProjects}
          icon={<FolderOpen className="w-3.5 h-3.5" />}
        />
        <MetricCard
          label="Jobs Active"
          value={totalQueued}
          icon={<Briefcase className="w-3.5 h-3.5" />}
          subtext={`${totalFailed} failed · ${totalCompleted} completed`}
          accent
        />
        <MetricCard
          label="Workers Online"
          value={workersOnline}
          icon={<Bot className="w-3.5 h-3.5" />}
          subtext={`of ${workers.length} registered`}
        />
      </div>

      {/* Job status row */}
      <div className="grid grid-cols-4 gap-3">
        {(['queued', 'running', 'failed', 'completed'] as const).map(s => (
          <div key={s} className="bg-obsidian-800 border border-border rounded-lg px-4 py-3 flex items-center justify-between">
            <Badge variant={jobStatusVariant(s)} className="capitalize">{s}</Badge>
            <span className="text-lg font-display text-cream">{jobsByStatus[s] ?? 0}</span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Recent Commands</span>
            <Terminal className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            {activityItems.length > 0
              ? <ActivityFeed items={activityItems} />
              : <p className="text-xs text-muted text-center py-6">No commands yet — use the Command Center to get started</p>
            }
          </CardBody>
        </Card>

        {/* Workers */}
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Workers</span>
            <Bot className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="space-y-3 py-3">
            {workers.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">No workers registered</p>
            ) : workers.map(worker => (
              <div key={worker.id} className="flex items-start gap-2.5">
                <StatusDot variant={agentStatusVariant(worker.status as 'online' | 'offline' | 'busy' | 'error')} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-cream">{worker.name}</p>
                  <p className="text-xs text-muted truncate">{worker.currentTask ?? 'Idle'}</p>
                  {worker.lastHeartbeat && (
                    <p className="text-xs text-muted/60">{formatRelative(worker.lastHeartbeat)}</p>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Recent jobs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Recent Jobs</span>
            <Briefcase className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            {recentJobs.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No jobs yet</p>
            ) : (
              <div className="divide-y divide-border">
                {recentJobs.map(job => (
                  <div key={job.id} className="flex items-center gap-3 py-3">
                    {job.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-status-failed shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-cream truncate">{job.title}</p>
                      <p className="text-xs text-muted">{job.project?.client?.name ?? job.type.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge variant={jobStatusVariant(job.status as JobStatus)}>
                      {job.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-muted shrink-0">{formatRelative(job.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Quick Stats</span>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Rocket className="w-3.5 h-3.5" />
                Waiting approval
              </div>
              <span className="text-sm font-medium text-cream">
                {jobsByStatus['waiting_for_approval'] ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted">
                <GitBranch className="w-3.5 h-3.5" />
                Deployed
              </div>
              <span className="text-sm font-medium text-cream">
                {jobsByStatus['deployed'] ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Terminal className="w-3.5 h-3.5" />
                Commands
              </div>
              <span className="text-sm font-medium text-cream">
                {recentMessages.length}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
