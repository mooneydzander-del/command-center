import { GitBranch, Play, RefreshCw } from 'lucide-react'
import { Badge, workflowStatusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatRelative } from '@/lib/utils'

type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed'

interface MockWorkflowRun {
  id: string
  templateName: string
  status: WorkflowStatus
  clientName?: string
  projectName?: string
  startedAt?: Date
  completedAt?: Date
  logsSummary?: string
}

const MOCK_RUNS: MockWorkflowRun[] = [
  { id: 'wr1', templateName: 'Website Build Pipeline', status: 'running', clientName: 'Apex Law Group', projectName: 'Apex Law — v2 Site', startedAt: new Date(Date.now() - 1000 * 60 * 18), logsSummary: 'Step 3/6: Generating component library…' },
  { id: 'wr2', templateName: 'New Client Onboarding', status: 'completed', clientName: 'Riviera Wellness', startedAt: new Date('2026-04-14'), completedAt: new Date('2026-04-14'), logsSummary: 'All 4 steps completed successfully' },
  { id: 'wr3', templateName: 'New Client Onboarding', status: 'completed', clientName: 'Blackstone Group', startedAt: new Date('2026-04-01'), completedAt: new Date('2026-04-01'), logsSummary: 'All 4 steps completed successfully' },
  { id: 'wr4', templateName: 'Deploy to Production', status: 'failed', clientName: 'Vantage Dental', projectName: 'Vantage — Site', startedAt: new Date('2026-03-28'), completedAt: new Date('2026-03-28'), logsSummary: 'Error: Vercel token expired. Manual re-deploy required.' },
  { id: 'wr5', templateName: 'Send Client Update', status: 'completed', clientName: 'Cinematic Co', startedAt: new Date('2026-04-05'), completedAt: new Date('2026-04-05'), logsSummary: 'Email delivered to hi@cinematic.co' },
  { id: 'wr6', templateName: 'Website Build Pipeline', status: 'completed', clientName: 'Novu Studio', projectName: 'Novu Studio — Site', startedAt: new Date('2026-03-25'), completedAt: new Date('2026-03-26'), logsSummary: 'Build complete. Preview deployed.' },
]

const TEMPLATES = [
  { name: 'New Client Onboarding', description: 'Creates DB record, sends welcome email, sets up project folder' },
  { name: 'Website Build Pipeline', description: 'Triggers Claude Worker, monitors build, creates preview deploy' },
  { name: 'Deploy to Production', description: 'Runs approval check, deploys to Vercel, notifies client' },
  { name: 'Send Client Update', description: 'Composes and sends status email to the linked client' },
]

export default function WorkflowsPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Workflows</h2>
          <p className="text-xs text-muted mt-0.5">{MOCK_RUNS.length} recent runs</p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Run history */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-medium text-muted uppercase tracking-widest">Run History</h3>
          <div className="bg-obsidian-800 border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Workflow</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Started</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RUNS.map((run, idx) => (
                  <tr key={run.id} className={`hover:bg-obsidian-700 transition-colors ${idx !== MOCK_RUNS.length - 1 ? 'border-b border-border' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-xs text-cream">{run.templateName}</p>
                      {run.projectName && <p className="text-xs text-muted">{run.projectName}</p>}
                      {run.logsSummary && <p className="text-xs text-muted/60 truncate max-w-48">{run.logsSummary}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{run.clientName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={workflowStatusVariant(run.status)}>{run.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {run.startedAt ? (run.status === 'running' ? formatRelative(run.startedAt) : formatDate(run.startedAt)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted uppercase tracking-widest">Available Templates</h3>
          <div className="space-y-2">
            {TEMPLATES.map(t => (
              <div key={t.name} className="bg-obsidian-800 border border-border rounded-lg p-3 hover:border-gold/20 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-muted shrink-0" />
                    <p className="text-xs font-medium text-cream">{t.name}</p>
                  </div>
                  <Button variant="ghost" size="sm" icon={<Play className="w-3 h-3" />} className="text-xs py-0.5 px-1.5 shrink-0">
                    Run
                  </Button>
                </div>
                <p className="text-xs text-muted leading-relaxed pl-5">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
