import { prisma } from '@/lib/db'
import { Rocket, ExternalLink, CheckCircle, Clock } from 'lucide-react'
import { Badge, deploymentStatusVariant } from '@/components/ui/Badge'
import { DeploymentApprovalButton } from '@/components/deployments/DeploymentApprovalButton'
import { formatDate, formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { DeploymentStatus, ApprovalState } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function ApprovalBadge({ state }: { state: string }) {
  if (state === 'not_required') return <span className="text-xs text-muted/40">—</span>
  const styles: Record<string, string> = {
    pending: 'text-status-waiting bg-status-waiting/10 border-status-waiting/30',
    approved: 'text-status-completed bg-status-completed/10 border-status-completed/30',
    rejected: 'text-status-failed bg-status-failed/10 border-status-failed/30',
  }
  const labels: Record<string, string> = {
    pending: 'Awaiting Approval',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return (
    <span className={cn('text-xs border px-2 py-0.5 rounded font-medium', styles[state] ?? 'text-muted border-border')}>
      {labels[state] ?? state}
    </span>
  )
}

export default async function DeploymentsPage() {
  const deployments = await prisma.deployment.findMany({
    include: {
      project: { select: { name: true, client: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const awaitingApproval = deployments.filter(d => d.approvalState === 'pending')

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Deployments</h2>
          <p className="text-xs text-muted mt-0.5">
            {awaitingApproval.length > 0
              ? <span className="text-status-waiting">{awaitingApproval.length} awaiting approval</span>
              : `${deployments.length} total deployments`
            }
          </p>
        </div>
      </div>

      {/* Approval queue */}
      {awaitingApproval.length > 0 && (
        <div className="bg-status-waiting/5 border border-status-waiting/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-status-waiting">
            <Clock className="w-3.5 h-3.5" />
            Deployments Awaiting Approval
          </div>
          {awaitingApproval.map(d => (
            <div key={d.id} className="flex items-center gap-3 bg-obsidian-800 border border-border rounded-md px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-cream">{d.project.name}</p>
                <p className="text-xs text-muted">{d.project.client.name} · {d.environment}</p>
                {d.url && <p className="text-xs text-muted/60">{d.url}</p>}
              </div>
              <DeploymentApprovalButton deploymentId={d.id} />
            </div>
          ))}
        </div>
      )}

      {/* All deployments */}
      {deployments.length === 0 ? (
        <div className="bg-obsidian-800 border border-border rounded-lg px-4 py-12 text-center">
          <Rocket className="w-5 h-5 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">No deployments yet</p>
          <p className="text-xs text-muted/60 mt-1">Deployments are created when jobs trigger a Vercel deploy</p>
        </div>
      ) : (
        <div className="bg-obsidian-800 border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Project</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Env</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Approval</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">URL</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">When</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((d, idx) => (
                <tr key={d.id} className={cn('hover:bg-obsidian-700 transition-colors', idx !== deployments.length - 1 && 'border-b border-border')}>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-cream">{d.project.name}</p>
                    <p className="text-xs text-muted">{d.project.client.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={d.environment === 'production' ? 'gold' : 'info'}>{d.environment}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={deploymentStatusVariant(d.status as DeploymentStatus)}>{d.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ApprovalBadge state={d.approvalState} />
                  </td>
                  <td className="px-4 py-3">
                    {d.url ? (
                      <a href={`https://${d.url}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted hover:text-cream transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        {d.url}
                      </a>
                    ) : <span className="text-xs text-muted/40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {d.status === 'building' ? formatRelative(d.createdAt) : formatDate(d.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
