import { prisma } from '@/lib/db'
import { claudeWorkerAdapter } from '@/services/claude-worker'
import { openAIOrchestrator } from '@/services/openai'
import { n8nAdapter } from '@/services/n8n'
import { Bot, Wifi, WifiOff, AlertTriangle, Activity, Clock, Brain, RefreshCw } from 'lucide-react'
import { Badge, agentStatusVariant, StatusDot } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { formatRelative } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TYPE_LABELS: Record<string, string> = {
  openai_orchestrator: 'OpenAI Orchestrator',
  claude_worker: 'Claude Code Worker',
  n8n: 'n8n Workflow Engine',
}

const TYPE_DESCRIPTIONS: Record<string, string> = {
  openai_orchestrator: 'Reads commands, classifies intent, creates jobs, and routes tasks. Never writes code.',
  claude_worker: 'The only coding worker. Builds websites, edits files, processes queued jobs, writes results back.',
  n8n: 'Workflow engine. Triggers automations, sends notifications, runs multi-step pipelines.',
}

const TYPE_ICON: Record<string, React.ElementType> = {
  openai_orchestrator: Brain,
  claude_worker: Bot,
  n8n: RefreshCw,
}

const STATUS_ICON: Record<string, React.ElementType> = {
  online: Wifi,
  offline: WifiOff,
  busy: Activity,
  error: AlertTriangle,
}

export default async function AgentsPage() {
  const [dbAgents, claudeStatus, openAIStatus, n8nAlive] = await Promise.all([
    prisma.agent.findMany({
      include: {
        _count: { select: { jobs: true } },
        jobs: { where: { status: { in: ['queued', 'running'] } }, take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { name: 'asc' },
    }),
    claudeWorkerAdapter.getStatus(),
    openAIOrchestrator.getStatus(),
    n8nAdapter.ping(),
  ])

  const agents = dbAgents
    .filter(a => a.type !== 'antigravity')
    .map(a => {
      let liveStatus = a.status
      let liveTask = a.currentTask
      let liveHeartbeat = a.lastHeartbeat

      if (a.type === 'openai_orchestrator') {
        liveStatus = openAIStatus.status
      } else if (a.type === 'claude_worker') {
        liveStatus = claudeStatus.status
        liveTask = claudeStatus.currentTask ?? a.currentTask
        liveHeartbeat = claudeStatus.lastHeartbeat ?? a.lastHeartbeat
      } else if (a.type === 'n8n') {
        liveStatus = n8nAlive ? 'online' : 'offline'
      }

      return { ...a, liveStatus, liveTask, liveHeartbeat }
    })

  const [completedCounts, failedCounts] = await Promise.all([
    prisma.job.groupBy({ by: ['agentId'], where: { status: { in: ['completed', 'deployed'] } }, _count: { id: true } }),
    prisma.job.groupBy({ by: ['agentId'], where: { status: 'failed' }, _count: { id: true } }),
  ])

  const completedByAgent = completedCounts.reduce((acc, r) => { if (r.agentId) acc[r.agentId] = r._count.id; return acc }, {} as Record<string, number>)
  const failedByAgent = failedCounts.reduce((acc, r) => { if (r.agentId) acc[r.agentId] = r._count.id; return acc }, {} as Record<string, number>)

  const online = agents.filter(a => a.liveStatus === 'online' || a.liveStatus === 'busy').length

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-xl text-cream">Agents</h2>
        <p className="text-xs text-muted mt-0.5">{online} of {agents.length} online</p>
      </div>

      {/* Status strip */}
      <div className="flex gap-3 flex-wrap">
        {agents.map(agent => (
          <div key={agent.id} className="flex items-center gap-2 bg-obsidian-800 border border-border rounded-md px-3 py-2">
            <StatusDot variant={agentStatusVariant(agent.liveStatus as 'online' | 'offline' | 'busy' | 'error')} />
            <span className="text-xs text-cream">{TYPE_LABELS[agent.type] ?? agent.name}</span>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map(agent => {
          const StatusIconComp = STATUS_ICON[agent.liveStatus] ?? WifiOff
          const TypeIconComp = TYPE_ICON[agent.type] ?? Bot
          const isError = agent.liveStatus === 'error'
          const isOffline = agent.liveStatus === 'offline'
          const activeJob = agent.jobs[0]

          return (
            <Card key={agent.id} className={isError ? 'border-status-failed/30' : isOffline ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                    isError ? 'bg-status-failed/10 border-status-failed/30' :
                    agent.liveStatus === 'online' || agent.liveStatus === 'busy' ? 'bg-gold/5 border-gold/20' :
                    'bg-obsidian-700 border-border'
                  }`}>
                    <TypeIconComp className={`w-4 h-4 ${
                      isError ? 'text-status-failed' :
                      agent.liveStatus === 'online' || agent.liveStatus === 'busy' ? 'text-gold' :
                      'text-muted'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">{TYPE_LABELS[agent.type] ?? agent.name}</p>
                    <p className="text-xs text-muted capitalize">{agent.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIconComp className={`w-3.5 h-3.5 ${
                    agent.liveStatus === 'online' ? 'text-status-running' :
                    agent.liveStatus === 'busy' ? 'text-status-waiting' :
                    agent.liveStatus === 'error' ? 'text-status-failed' : 'text-muted'
                  }`} />
                  <Badge variant={agentStatusVariant(agent.liveStatus as 'online' | 'offline' | 'busy' | 'error')}>
                    {agent.liveStatus}
                  </Badge>
                </div>
              </CardHeader>

              <CardBody className="space-y-3">
                <p className="text-xs text-muted leading-relaxed">
                  {TYPE_DESCRIPTIONS[agent.type] ?? agent.type}
                </p>

                {agent.liveTask && (
                  <div className="bg-obsidian-900 border border-border rounded-md px-3 py-2">
                    <p className="text-xs text-muted uppercase tracking-widest mb-1">Current Task</p>
                    <p className="text-xs text-cream">{agent.liveTask}</p>
                  </div>
                )}

                {activeJob && !agent.liveTask && (
                  <div className="bg-obsidian-900 border border-border rounded-md px-3 py-2">
                    <p className="text-xs text-muted uppercase tracking-widest mb-1">Assigned Job</p>
                    <Link href="/jobs" className="text-xs text-gold hover:underline transition-colors">
                      {activeJob.title}
                    </Link>
                  </div>
                )}

                {agent.errorState && (
                  <div className="bg-status-failed/5 border border-status-failed/20 rounded-md px-3 py-2">
                    <p className="text-xs text-muted uppercase tracking-widest mb-1">Error</p>
                    <p className="text-xs text-status-failed">{agent.errorState}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-muted">
                    <Clock className="w-3 h-3" />
                    <span>{agent.liveHeartbeat ? formatRelative(agent.liveHeartbeat) : 'No heartbeat'}</span>
                  </div>
                  <div className="flex gap-3 text-muted">
                    <span><span className="text-status-running">{completedByAgent[agent.id] ?? 0}</span> completed</span>
                    {(failedByAgent[agent.id] ?? 0) > 0 && (
                      <span><span className="text-status-failed">{failedByAgent[agent.id]}</span> failed</span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-20">
          <Bot className="w-6 h-6 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">No agents registered.</p>
          <p className="text-xs text-muted/60 mt-1">Agents register via POST /api/agents with their ID and status.</p>
        </div>
      )}

      <p className="text-xs text-muted/40 border-t border-border pt-4">
        Agents report via <code className="text-muted/60">POST /api/agents</code> with status, currentTask, and errorState.
      </p>
    </div>
  )
}
