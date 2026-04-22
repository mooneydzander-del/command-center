import { Bot, Wifi, WifiOff, AlertTriangle, RefreshCw, Clock, Brain } from 'lucide-react'
import { Badge, agentStatusVariant, StatusDot } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatRelative } from '@/lib/utils'

type WorkerStatus = 'online' | 'offline' | 'busy' | 'error'
type WorkerType = 'openai_orchestrator' | 'claude_worker' | 'antigravity' | 'n8n'

interface MockWorker {
  id: string
  name: string
  type: WorkerType
  status: WorkerStatus
  currentTask: string | null
  lastHeartbeat: Date | null
  errorState: string | null
  jobsCompleted: number
  jobsFailed: number
  model?: string
}

const MOCK_WORKERS: MockWorker[] = [
  {
    id: 'w1',
    name: 'OpenAI Orchestrator',
    type: 'openai_orchestrator',
    status: 'online',
    currentTask: 'Classifying: "Build Apex Law landing page"',
    lastHeartbeat: new Date(Date.now() - 1000 * 30),
    errorState: null,
    jobsCompleted: 47,
    jobsFailed: 0,
    model: 'gpt-4o',
  },
  {
    id: 'w2',
    name: 'Claude Code Worker',
    type: 'claude_worker',
    status: 'busy',
    currentTask: 'Building apex-law-v2: generating HTML/CSS/JS',
    lastHeartbeat: new Date(Date.now() - 1000 * 12),
    errorState: null,
    jobsCompleted: 31,
    jobsFailed: 1,
    model: 'claude-sonnet-4-6',
  },
  {
    id: 'w3',
    name: 'n8n Engine',
    type: 'n8n',
    status: 'online',
    currentTask: 'Monitoring workflow triggers',
    lastHeartbeat: new Date(Date.now() - 1000 * 60 * 2),
    errorState: null,
    jobsCompleted: 18,
    jobsFailed: 0,
  },
  {
    id: 'w4',
    name: 'Antigravity',
    type: 'antigravity',
    status: 'offline',
    currentTask: null,
    lastHeartbeat: null,
    errorState: null,
    jobsCompleted: 0,
    jobsFailed: 0,
  },
]

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

const STATUS_ICON: Record<WorkerStatus, React.ElementType> = {
  online: Wifi,
  offline: WifiOff,
  busy: RefreshCw,
  error: AlertTriangle,
}

export default function WorkersPage() {
  const online = MOCK_WORKERS.filter(w => w.status === 'online' || w.status === 'busy').length
  const total = MOCK_WORKERS.length

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Workers</h2>
          <p className="text-xs text-muted mt-0.5">{online} of {total} online</p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh
        </Button>
      </div>

      {/* Summary strip */}
      <div className="flex gap-3 flex-wrap">
        {MOCK_WORKERS.map(worker => (
          <div key={worker.id} className="flex items-center gap-2 bg-obsidian-800 border border-border rounded-md px-3 py-2">
            <StatusDot variant={agentStatusVariant(worker.status)} />
            <span className="text-xs text-cream">{worker.name}</span>
            {worker.model && <span className="text-xs text-muted/60">({worker.model})</span>}
          </div>
        ))}
      </div>

      {/* Role explanation */}
      <div className="bg-gold/5 border border-gold/20 rounded-lg px-4 py-3">
        <p className="text-xs text-gold/80 font-medium mb-1">System roles</p>
        <p className="text-xs text-muted leading-relaxed">
          <span className="text-cream">OpenAI Orchestrator</span> reads your commands, creates jobs, and routes them. &nbsp;
          <span className="text-cream">Claude Code Worker</span> executes coding jobs — it is the only system that writes or edits code. &nbsp;
          <span className="text-cream">n8n</span> handles automations and pipelines.
        </p>
      </div>

      {/* Worker cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MOCK_WORKERS.map(worker => {
          const StatusIconComp = STATUS_ICON[worker.status]
          const TypeIconComp = TYPE_ICON[worker.type]
          return (
            <Card key={worker.id} className={worker.status === 'error' ? 'border-status-failed/30' : ''}>
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
                    worker.status === 'online' ? 'text-status-running' :
                    worker.status === 'busy' ? 'text-status-waiting animate-spin' :
                    worker.status === 'error' ? 'text-status-failed' :
                    'text-muted'
                  }`} />
                  <Badge variant={agentStatusVariant(worker.status)} className="capitalize">
                    {worker.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardBody className="space-y-3">
                <p className="text-xs text-muted/80 leading-relaxed">{TYPE_DESCRIPTIONS[worker.type]}</p>

                {worker.currentTask && (
                  <div className="bg-obsidian-900 border border-border rounded-md px-3 py-2">
                    <p className="text-xs text-muted uppercase tracking-widest mb-1">Current Task</p>
                    <p className="text-xs text-cream">{worker.currentTask}</p>
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
                    {worker.lastHeartbeat ? formatRelative(worker.lastHeartbeat) : 'No heartbeat'}
                  </div>
                  <div className="flex gap-3 text-muted">
                    <span><span className="text-status-completed">{worker.jobsCompleted}</span> done</span>
                    {worker.jobsFailed > 0 && (
                      <span><span className="text-status-failed">{worker.jobsFailed}</span> failed</span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
