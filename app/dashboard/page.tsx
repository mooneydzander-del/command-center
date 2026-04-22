import {
  Users,
  FolderOpen,
  Briefcase,
  Bot,
  Terminal,
  Rocket,
  GitBranch,
  AlertCircle,
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { ActivityFeed, type ActivityItem } from '@/components/dashboard/ActivityFeed'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge, jobStatusVariant, agentStatusVariant } from '@/components/ui/Badge'
import { StatusDot } from '@/components/ui/Badge'
import { formatRelative } from '@/lib/utils'

// Seed data for Phase 1 UI preview
const MOCK_METRICS = {
  activeClients: 8,
  activeProjects: 5,
  jobs: { queued: 3, running: 2, failed: 1, completed: 24 },
  agentsOnline: 2,
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', type: 'message', title: 'New command: Build landing page for Apex Law', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
  { id: '2', type: 'job', title: 'Job completed: Deploy cinematic-co preview', subtitle: 'Claude Code Worker', timestamp: new Date(Date.now() - 1000 * 60 * 18) },
  { id: '3', type: 'deployment', title: 'Preview deployed: apex-law-v2.vercel.app', subtitle: 'preview · awaiting approval', timestamp: new Date(Date.now() - 1000 * 60 * 45) },
  { id: '4', type: 'workflow', title: 'Workflow: New Client Onboarding completed', subtitle: 'Riviera Wellness', timestamp: new Date(Date.now() - 1000 * 60 * 90) },
  { id: '5', type: 'agent', title: 'OpenAI Orchestrator online', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
]

const MOCK_WORKERS = [
  { id: 'w1', name: 'OpenAI Orchestrator', type: 'openai_orchestrator', status: 'online', currentTask: 'Classifying: Apex Law build command', lastHeartbeat: new Date(Date.now() - 1000 * 30) },
  { id: 'w2', name: 'Claude Code Worker', type: 'claude_worker', status: 'busy', currentTask: 'Building: apex-law-v2', lastHeartbeat: new Date(Date.now() - 1000 * 12) },
  { id: 'w3', name: 'n8n Engine', type: 'n8n', status: 'online', currentTask: 'Monitoring triggers', lastHeartbeat: new Date(Date.now() - 1000 * 60 * 2) },
]

const MOCK_JOBS = [
  { id: 'j1', title: 'Build landing page — Apex Law', status: 'running', type: 'build_site', updatedAt: new Date(Date.now() - 1000 * 60 * 3) },
  { id: 'j2', title: 'Deploy preview — Cinematic Co', status: 'completed', type: 'deploy', updatedAt: new Date(Date.now() - 1000 * 60 * 20) },
  { id: 'j3', title: 'Revision request — Riviera Wellness', status: 'queued', type: 'revision', updatedAt: new Date(Date.now() - 1000 * 60 * 35) },
  { id: 'j4', title: 'Asset upload — Blackstone Group', status: 'failed', type: 'upload_assets', updatedAt: new Date(Date.now() - 1000 * 60 * 55) },
]

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl text-cream">Good morning.</h2>
        <p className="text-xs text-muted mt-0.5">Here&apos;s what&apos;s happening across your agency.</p>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Clients"
          value={MOCK_METRICS.activeClients}
          icon={<Users className="w-3.5 h-3.5" />}
          subtext="2 prospects in pipeline"
        />
        <MetricCard
          label="Active Projects"
          value={MOCK_METRICS.activeProjects}
          icon={<FolderOpen className="w-3.5 h-3.5" />}
          subtext="1 awaiting review"
        />
        <MetricCard
          label="Jobs Running"
          value={`${MOCK_METRICS.jobs.running} / ${MOCK_METRICS.jobs.queued + MOCK_METRICS.jobs.running}`}
          icon={<Briefcase className="w-3.5 h-3.5" />}
          subtext={`${MOCK_METRICS.jobs.failed} failed · ${MOCK_METRICS.jobs.completed} completed`}
          accent
        />
        <MetricCard
          label="Workers Online"
          value={MOCK_METRICS.agentsOnline}
          icon={<Bot className="w-3.5 h-3.5" />}
          subtext="of 3 registered"
        />
      </div>

      {/* Job status row */}
      <div className="grid grid-cols-4 gap-3">
        {(['queued', 'running', 'failed', 'completed'] as const).map(s => (
          <div key={s} className="bg-obsidian-800 border border-border rounded-lg px-4 py-3 flex items-center justify-between">
            <Badge variant={jobStatusVariant(s)} className="capitalize">{s}</Badge>
            <span className="text-lg font-display text-cream">
              {MOCK_METRICS.jobs[s as keyof typeof MOCK_METRICS.jobs]}
            </span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Recent Activity</span>
            <Terminal className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            <ActivityFeed items={MOCK_ACTIVITY} />
          </CardBody>
        </Card>

        {/* Workers */}
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Workers</span>
            <Bot className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="space-y-3 py-3">
            {MOCK_WORKERS.map(worker => (
              <div key={worker.id} className="flex items-start gap-2.5">
                <StatusDot variant={agentStatusVariant(worker.status as 'online' | 'offline' | 'busy' | 'error')} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-cream">{worker.name}</p>
                  <p className="text-xs text-muted truncate">
                    {worker.currentTask ?? 'Idle'}
                  </p>
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
            <div className="divide-y divide-border">
              {MOCK_JOBS.map(job => (
                <div key={job.id} className="flex items-center gap-3 py-3">
                  {job.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-status-failed shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cream truncate">{job.title}</p>
                    <p className="text-xs text-muted">{job.type.replace('_', ' ')}</p>
                  </div>
                  <Badge variant={jobStatusVariant(job.status as Parameters<typeof jobStatusVariant>[0])}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted shrink-0">{formatRelative(job.updatedAt)}</span>
                </div>
              ))}
            </div>
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
                Deployments today
              </div>
              <span className="text-sm font-medium text-cream">4</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted">
                <GitBranch className="w-3.5 h-3.5" />
                Workflow runs
              </div>
              <span className="text-sm font-medium text-cream">7</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Terminal className="w-3.5 h-3.5" />
                Commands issued
              </div>
              <span className="text-sm font-medium text-cream">12</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
