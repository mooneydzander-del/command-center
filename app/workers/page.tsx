import { prisma } from '@/lib/db'
import { claudeWorkerAdapter } from '@/services/claude-worker'
import { openAIOrchestrator } from '@/services/openai'
import { n8nAdapter } from '@/services/n8n'
import { Bot, Wifi, WifiOff, AlertTriangle, RefreshCw, Clock, Brain } from 'lucide-react'
import { Badge, agentStatusVariant, StatusDot } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { formatRelative } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type WorkerType = 'openai_orchestrator' | 'claude_worker' | 'antigravity' | 'n8n'

const TYPE_DESCRIPTIONS: Record<WorkerType, string> = {
  openai_orchestrator: 'Brain & dispatcher — classifies commands, creates jobs, routes tasks to Claude Code. Never writes code.',
  claude_worker: 'Coding worker — builds websites, processes files, writes and edits code. Reads queued jobs, writes results back.',
  antigravity: 'Optional synced advanced workspace. Not the primary controller.',
  n8n: 'Workflow engine — triggers automations, sends notifications, runs multi-step pipelines.',
}

const TYPE_ICON: Record<WorkerType, React.ElementType> = {
  openai_orchestrator: Brain,
  claude_worker: Bot,
  antigravity: Bot,
  n8n: RefreshCw,
}

const STATUS_ICON: Record<string, React.ElementType> = {
  online: Wifi,
  offline: WifiOff,
  busy: RefreshCw,
  error: AlertTriangle,
}

export default async function WorkersPage() {
  // Fetch DB workers + live status from adapters in parallel
  const [dbWorkers, claudeStatus, openAIStatus, n8nAlive] = await Promise.all([
    prisma.agent.findMany({
      include: { _count: { select: { jobs: true } } },
      orderBy: { name: 'asc' },
    }),
    claudeWorkerAdapter.getStatus(),
    openAIOrchestrator.getStatus(),
    n8nAdapter.ping(),
  ])

  // Merge live status into DB workers
  const workers = dbWorkers.map(w => {
    let liveStatus = w.status
    let liveTask = w.currentTask
    let liveHeartbeat = w.lastHeartbeat

    if (w.type === 'openai_orchestrator') {
      liveStatus = openAIStatus.status
    } else if (w.type === 'claude_worker') {
      liveStatus = claudeStatus.status
      liveTask = claudeStatus.currentTask ?? w.currentTask
      liveHeartbeat = claudeStatus.lastHeartbeat ?? w.lastHeartbeat
    } else if (w.type === 'n8n') {
      liveStatus = n8nAlive ? 'online' : 'offline'
    }

    return { ...w, liveStatus, liveTask, liveHeartbeat }
  })

  const online = workers.filter(w => w.liveStatus === 'online' || w.liveStatus === 'busy').length

  // Count jobs completed per worker
  const jobCompletedCounts = await prisma.job.groupBy({
    by: ['agentId'],
    where: { status: { in: ['completed', 'deployed'] } },
    _count: { id: true },
  })
  const completedByAgent = jobCompletedCounts.reduce((acc, row) => {
    if (row.agentId) acc[row.agentId] = row._count.id
    return acc
  }, {} as Record<string, number>)

  const failedCounts = await prisma.job.groupBy({
    by: ['agentId'],
    where: { status: 'failed' },
    _count: { id: true },
  })
  const failedByAgent = failedCounts.reduce((acc, row) => {
    if (row.agentId) acc[row.agentId] = row._count.id
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Workers</h2>
          <p className="text-xs text-muted mt-0.5">{online} of {workers.length} online</p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex gap-3 flex-wrap">
        {workers.map(worker => (
          <div key={worker.id} className="flex items-center gap-2 bg-obsidian-800 border border-border rounded-md px-3 py-2">
            <StatusDot variant={agentStatusVariant(worker.liveStatus as 'online' | 'offline' | 'busy' | 'error')} />
            <span className="text-xs text-cream">{worker.name}</span>
          </div>
        ))}
      </div>

      {/* Role explanation */}
      <div className="bg-gold/5 border border-gold/20 rounded-lg px-4 py-3">
        <p className="text-xs text-gold/80 font-medium mb-1">System roles</p>
        <p className="text-xs text-muted leading-relaxed">
          <span className="text-cream">OpenAI Orchestrator</span> reads your commands, creates jobs, and routes them. &nbsp;
          <span className="text-cream">Claude Code Worker</span> is the only system that writes or edits code. &nbsp;
          <span className="text-cream">n8n</span> handles automations and pipelines.
        </p>
      </div>

      {/* Worker cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {workers.map(worker => {
          const StatusIconComp = STATUS_ICON[worker.liveStatus] ?? WifiOff
          const TypeIconComp = TYPE_ICON[worker.type as WorkerType] ?? Bot
          const isError = worker.liveStatus === 'error'
          return (
            <Card key={worker.id} className={isError ? 'border-status-failed/30' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-obsidian-700 border border-border flex items-center justify-center">
                    <TypeIconComp className="w-4 h-4 text-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">{worker.name}</p>
                    <p className="text-xs text-muted capitalize">{worker.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIconComp className={`w-3.5 h-3.5 ${
                    worker.liveStatus === 'online' ? 'text-status-running' :
                    worker.liveStatus === 'busy' ? 'text-status-waiting animate-spin' :
                    worker.liveStatus === 'error' ? 'text-status-failed' : 'text-muted'
                  }`} />
                  <Badge variant={agentStatusVariant(worker.liveStatus as 'online' | 'offline' | 'busy' | 'error')} className="capitalize">
                    {worker.liveStatus}
                  </Badge>
                </div>
              </CardHeader>

              <CardBody className="space-y-3">
                <p className="text-xs text-muted/80 leading-relaxed">
                  {TYPE_DESCRIPTIONS[worker.type as WorkerType] ?? worker.type}
                </p>

                {worker.liveTask && (
                  <div className="bg-obsidian-900 border border-border rounded-md px-3 py-2">
                    <p className="text-xs text-muted uppercase tracking-widest mb-1">Current Task</p>
                    <p className="text-xs text-cream">{worker.liveTask}</p>
                  </div>
                )}

                {worker.errorState && (
                  <div className="bg-status-failed/5 border border-status-failed/20 rounded-md px-3 py-2">
                    <p className="text-xs text-status-failed">{worker.errorState}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                  <div className="flex items-center gap-1.5 text-muted">
                    <Clock className="w-3 h-3" />
                    {worker.liveHeartbeat ? formatRelative(worker.liveHeartbeat) : 'No heartbeat'}
                  </div>
                  <div className="flex gap-3 text-muted">
                    <span><span className="text-status-completed">{completedByAgent[worker.id] ?? 0}</span> done</span>
                    {(failedByAgent[worker.id] ?? 0) > 0 && (
                      <span><span className="text-status-failed">{failedByAgent[worker.id]}</span> failed</span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {workers.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-muted">No workers registered yet.</p>
          <p className="text-xs text-muted/60 mt-1">Workers register via POST /api/workers with their ID and status.</p>
        </div>
      )}
    </div>
  )
}
