import { Rocket, ExternalLink, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { Badge, deploymentStatusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

type DeploymentStatus = 'pending' | 'building' | 'ready' | 'error' | 'cancelled'
type ApprovalState = 'not_required' | 'pending' | 'approved' | 'rejected'

interface MockDeployment {
  id: string
  projectName: string
  clientName: string
  environment: 'preview' | 'production'
  status: DeploymentStatus
  url?: string
  approvalState: ApprovalState
  commitSha?: string
  createdAt: Date
  readyAt?: Date
}

const MOCK_DEPLOYMENTS: MockDeployment[] = [
  { id: 'd1', projectName: 'Apex Law — v2', clientName: 'Apex Law Group', environment: 'preview', status: 'building', url: undefined, approvalState: 'not_required', commitSha: 'abc1234', createdAt: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 'd2', projectName: 'Riviera — Landing Page', clientName: 'Riviera Wellness', environment: 'preview', status: 'ready', url: 'riviera-wellness-preview.vercel.app', approvalState: 'pending', commitSha: 'def5678', createdAt: new Date(Date.now() - 1000 * 60 * 45), readyAt: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 'd3', projectName: 'Cinematic Co — Full Build', clientName: 'Cinematic Co', environment: 'production', status: 'ready', url: 'cinematic.co', approvalState: 'approved', commitSha: 'ghi9012', createdAt: new Date('2026-04-05'), readyAt: new Date('2026-04-05') },
  { id: 'd4', projectName: 'Novu Studio — Site', clientName: 'Novu Studio', environment: 'production', status: 'ready', url: 'novu.design', approvalState: 'approved', commitSha: 'jkl3456', createdAt: new Date('2026-03-28'), readyAt: new Date('2026-03-28') },
  { id: 'd5', projectName: 'Vantage Dental', clientName: 'Vantage Dental', environment: 'production', status: 'error', url: undefined, approvalState: 'approved', commitSha: 'mno7890', createdAt: new Date('2026-03-28') },
]

function ApprovalBadge({ state }: { state: ApprovalState }) {
  if (state === 'not_required') return null
  const variants: Record<ApprovalState, { label: string; className: string }> = {
    not_required: { label: '', className: '' },
    pending: { label: 'Awaiting Approval', className: 'text-status-waiting bg-status-waiting/10 border-status-waiting/30' },
    approved: { label: 'Approved', className: 'text-status-completed bg-status-completed/10 border-status-completed/30' },
    rejected: { label: 'Rejected', className: 'text-status-failed bg-status-failed/10 border-status-failed/30' },
  }
  const v = variants[state]
  return (
    <span className={cn('text-xs border px-2 py-0.5 rounded font-medium', v.className)}>{v.label}</span>
  )
}

export default function DeploymentsPage() {
  const awaitingApproval = MOCK_DEPLOYMENTS.filter(d => d.approvalState === 'pending').length

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Deployments</h2>
          <p className="text-xs text-muted mt-0.5">
            {awaitingApproval > 0 ? (
              <span className="text-status-waiting">{awaitingApproval} awaiting approval</span>
            ) : (
              'All deployments up to date'
            )}
          </p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>Refresh</Button>
      </div>

      {/* Approval queue */}
      {awaitingApproval > 0 && (
        <div className="bg-status-waiting/5 border border-status-waiting/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-status-waiting">
            <Clock className="w-3.5 h-3.5" />
            Deployments Awaiting Approval
          </div>
          {MOCK_DEPLOYMENTS.filter(d => d.approvalState === 'pending').map(d => (
            <div key={d.id} className="flex items-center gap-3 bg-obsidian-800 border border-border rounded-md px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-cream">{d.projectName}</p>
                <p className="text-xs text-muted">{d.clientName} · {d.environment}</p>
                {d.url && <p className="text-xs text-muted/60">{d.url}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="danger" size="sm">Reject</Button>
                <Button variant="primary" size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />}>Approve</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All deployments */}
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
            {MOCK_DEPLOYMENTS.map((d, idx) => (
              <tr key={d.id} className={cn(
                'hover:bg-obsidian-700 transition-colors',
                idx !== MOCK_DEPLOYMENTS.length - 1 && 'border-b border-border'
              )}>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-cream">{d.projectName}</p>
                  <p className="text-xs text-muted">{d.clientName}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={d.environment === 'production' ? 'gold' : 'info'}>{d.environment}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={deploymentStatusVariant(d.status)}>{d.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <ApprovalBadge state={d.approvalState} />
                  {d.approvalState === 'not_required' && <span className="text-xs text-muted/40">—</span>}
                </td>
                <td className="px-4 py-3">
                  {d.url ? (
                    <a href={`https://${d.url}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted hover:text-cream transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      {d.url}
                    </a>
                  ) : (
                    <span className="text-xs text-muted/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {d.status === 'building' ? formatRelative(d.createdAt) : formatDate(d.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
