import { prisma } from '@/lib/db'
import { n8nAdapter } from '@/services/n8n'
import { GitBranch, Play, RefreshCw } from 'lucide-react'
import { Badge, workflowStatusVariant } from '@/components/ui/Badge'
import { formatDate, formatRelative } from '@/lib/utils'
import type { WorkflowStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function WorkflowsPage() {
  const [runs, templates] = await Promise.all([
    prisma.workflowRun.findMany({
      include: {
        client: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    n8nAdapter.listWorkflows(),
  ])

  const runningCount = runs.filter(r => r.status === 'running').length

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Workflows</h2>
          <p className="text-xs text-muted mt-0.5">
            {runs.length} runs · {runningCount > 0 ? <span className="text-status-waiting">{runningCount} running</span> : 'none active'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Run history */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-medium text-muted uppercase tracking-widest">Run History</h3>
          {runs.length === 0 ? (
            <div className="bg-obsidian-800 border border-border rounded-lg px-4 py-10 text-center">
              <p className="text-xs text-muted">No workflow runs yet</p>
              <p className="text-xs text-muted/60 mt-1">Trigger a workflow from the templates panel →</p>
            </div>
          ) : (
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
                  {runs.map((run, idx) => (
                    <tr key={run.id} className={`hover:bg-obsidian-700 transition-colors ${idx !== runs.length - 1 ? 'border-b border-border' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="text-xs text-cream">{run.templateName}</p>
                        {run.project && <p className="text-xs text-muted">{run.project.name}</p>}
                        {run.logsJson && (
                          <p className="text-xs text-muted/60 truncate max-w-48">
                            {(() => { try { return JSON.parse(run.logsJson).summary ?? run.logsJson } catch { return run.logsJson } })()}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">{run.client?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={workflowStatusVariant(run.status as WorkflowStatus)}>{run.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {run.startedAt
                          ? run.status === 'running' ? formatRelative(run.startedAt) : formatDate(run.startedAt)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* n8n Templates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted uppercase tracking-widest">n8n Templates</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <RefreshCw className="w-3 h-3" />
              <span>{templates.length} found</span>
            </div>
          </div>
          {templates.length === 0 ? (
            <div className="bg-obsidian-800 border border-border rounded-lg p-4 text-center">
              <p className="text-xs text-muted">Could not reach n8n</p>
              <p className="text-xs text-muted/60 mt-1">Check N8N_BASE_URL and N8N_API_KEY</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map(t => (
                <div key={t.id} className="bg-obsidian-800 border border-border rounded-lg p-3 hover:border-gold/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3.5 h-3.5 text-muted shrink-0" />
                      <p className="text-xs font-medium text-cream">{t.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${t.active ? 'bg-status-running' : 'bg-muted'}`} />
                      <form action={`/api/workflows`} method="POST">
                        <input type="hidden" name="templateName" value={t.name} />
                        <button type="submit"
                          className="flex items-center gap-1 text-xs text-muted hover:text-cream border border-border rounded px-1.5 py-0.5 hover:border-gold/30 transition-colors">
                          <Play className="w-3 h-3" />
                          Run
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
