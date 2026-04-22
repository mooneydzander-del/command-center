import { Bot, Wifi, WifiOff, AlertTriangle, RefreshCw, Clock } from 'lucide-react'
import { Badge, agentStatusVariant, StatusDot } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatRelative } from '@/lib/utils'

type AgentStatus = 'online' | 'offline' | 'busy' | 'error'
type AgentType = 'openclaw' | 'claude_worker' | 'antigravity' | 'n8n'

interface MockAgent {
  id: string
  name: string
  type: AgentType
  status: AgentStatus
  currentTask: string | null
  lastHeartbeat: Date | null
  errorState: string | null
  jobsCompleted: number
  jobsFailed: number
}

const MOCK_AGENTS: MockAgent[] = [
  {
    id: 'a1',
    name: 'OpenClaw',
    type: 'openclaw',
    status: 'online',
    currentTask: 'Dispatching: Apex Law build job',
    lastHeartbeat: new Date(Date.now() - 1000 * 30),
    errorState: null,
    jobsCompleted: 47,
    jobsFailed: 2,
  },
  {
    id: 'a2',
    name: 'Claude Worker #1',
    type: 'claude_worker',
    status: 'busy',
    currentTask: 'Building apex-law-v2: generating HTML/CSS/JS',
    lastHeartbeat: new Date(Date.now() - 1000 * 12),
    errorState: null,
    jobsCompleted: 31,
    jobsFailed: 1,
  },
  {
    id: 'a3',
    name: 'Antigravity',
    type: 'antigravity',
    status: 'offline',
    currentTask: null,
    lastHeartbeat: null,
    errorState: null,
    jobsCompleted: 0,
    jobsFailed: 0,
  },
  {
    id: 'a4',
    name: 'n8n Engine',
    type: 'n8n',
    status: 'online',
    currentTask: 'Monitoring workflow triggers',
    lastHeartbeat: new Date(Date.now() - 1000 * 60 * 2),
    errorState: null,
    jobsCompleted: 18,
    jobsFailed: 0,
  },
]

const TYPE_DESCRIPTIONS: Record<AgentType, string> = {
  openclaw: 'Commander & dispatcher — reads commands, creates jobs, coordinates workers',
  claude_worker: 'Coding worker — builds websites, processes files, writes code',
  antigravity: 'Optional synced advanced workspace — not primary controller',
  n8n: 'Workflow engine — triggers automations, sends notifications, runs pipelines',
}

const STATUS_ICON: Record<AgentStatus, React.ElementType> = {
  online: Wifi,
  offline: WifiOff,
  busy: RefreshCw,
  error: AlertTriangle,
}

export default function AgentsPage() {
  const online = MOCK_AGENTS.filter(a => a.status === 'online' || a.status === 'busy').length
  const total = MOCK_AGENTS.length

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Agents</h2>
          <p className="text-xs text-muted mt-0.5">{online} of {total} online</p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh
        </Button>
      </div>

      {/* Summary strip */}
      <div className="flex gap-3">
        {MOCK_AGENTS.map(agent => (
          <div key={agent.id} className="flex items-center gap-2 bg-obsidian-800 border border-border rounded-md px-3 py-2">
            <StatusDot variant={agentStatusVariant(agent.status)} />
            <span className="text-xs text-cream">{agent.name}</span>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MOCK_AGENTS.map(agent => {
          const StatusIconComp = STATUS_ICON[agent.status]
          return (
            <Card key={agent.id} className={agent.status === 'error' ? 'border-status-failed/30' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-obsidian-700 border border-border flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-cream">{agent.name}</p>
                    <p className="text-xs text-muted capitalize">{agent.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIconComp className={`w-3.5 h-3.5 ${
                    agent.status === 'online' ? 'text-status-running' :
                    agent.status === 'busy' ? 'text-status-waiting animate-spin' :
                    agent.status === 'error' ? 'text-status-failed' :
                    'text-muted'
                  }`} />
                  <Badge variant={agentStatusVariant(agent.status)} className="capitalize">
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardBody className="space-y-3">
                <p className="text-xs text-muted/80 leading-relaxed">{TYPE_DESCRIPTIONS[agent.type]}</p>

                {agent.currentTask && (
                  <div className="bg-obsidian-900 border border-border rounded-md px-3 py-2">
                    <p className="text-xs text-muted uppercase tracking-widest mb-1">Current Task</p>
                    <p className="text-xs text-cream">{agent.currentTask}</p>
                  </div>
                )}

                {agent.errorState && (
                  <div className="bg-status-failed/5 border border-status-failed/20 rounded-md px-3 py-2">
                    <p className="text-xs text-status-failed">{agent.errorState}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                  <div className="flex items-center gap-3 text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {agent.lastHeartbeat ? formatRelative(agent.lastHeartbeat) : 'No heartbeat'}
                    </span>
                  </div>
                  <div className="flex gap-3 text-muted">
                    <span><span className="text-status-completed">{agent.jobsCompleted}</span> done</span>
                    {agent.jobsFailed > 0 && (
                      <span><span className="text-status-failed">{agent.jobsFailed}</span> failed</span>
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
