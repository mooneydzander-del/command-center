import { ArrowLeft, ExternalLink, FolderOpen, Briefcase, Rocket, GitBranch } from 'lucide-react'
import Link from 'next/link'
import { Badge, projectStatusVariant, jobStatusVariant, deploymentStatusVariant } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, formatRelative } from '@/lib/utils'

const PROJECT = {
  id: 'p1',
  name: 'Apex Law — v2 Site',
  clientName: 'Apex Law Group',
  clientId: 'c1',
  status: 'in_progress' as const,
  description: 'Full cinematic redesign for Apex Law Group. Video background hero, dark legal aesthetic, gold accent system, scroll-reveal animations.',
  previewUrl: 'apex-law-v2.vercel.app',
  productionUrl: null,
  assignedAgents: ['OpenClaw', 'Claude Worker'],
  createdAt: new Date('2026-04-10'),
  updatedAt: new Date('2026-04-18'),
}

const JOBS = [
  { id: 'j1', title: 'Build landing page', status: 'running' as const, type: 'build_site', updatedAt: new Date(Date.now() - 1000 * 60 * 3) },
  { id: 'j2', title: 'Upload brand assets', status: 'completed' as const, type: 'upload_assets', updatedAt: new Date('2026-04-16') },
  { id: 'j3', title: 'Setup Vercel project', status: 'completed' as const, type: 'setup_infra', updatedAt: new Date('2026-04-12') },
]

const DEPLOYMENTS = [
  { id: 'd1', environment: 'preview', status: 'ready' as const, url: 'apex-law-v2-abc123.vercel.app', approvalState: 'not_required', createdAt: new Date('2026-04-18') },
  { id: 'd2', environment: 'preview', status: 'ready' as const, url: 'apex-law-v2-def456.vercel.app', approvalState: 'not_required', createdAt: new Date('2026-04-15') },
]

const WORKFLOW_RUNS = [
  { id: 'wr1', templateName: 'New Client Onboarding', status: 'completed', startedAt: new Date('2026-04-10') },
  { id: 'wr2', templateName: 'Website Build Pipeline', status: 'running', startedAt: new Date('2026-04-18') },
]

export default function ProjectDetailPage() {
  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-6xl">
      <div>
        <Link href="/projects" className="flex items-center gap-1.5 text-xs text-muted hover:text-cream transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          All Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl text-cream">{PROJECT.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Link href={`/clients/${PROJECT.clientId}`} className="text-xs text-muted hover:text-gold transition-colors">
                {PROJECT.clientName}
              </Link>
              <span className="text-muted/40">·</span>
              <span className="text-xs text-muted">{formatDate(PROJECT.updatedAt)}</span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant={projectStatusVariant(PROJECT.status)}>{PROJECT.status.replace('_', ' ')}</Badge>
            <Button variant="primary" size="sm" icon={<Rocket className="w-3.5 h-3.5" />}>
              Deploy
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Description + meta */}
        <Card className="col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Overview</span>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-cream/80 leading-relaxed">{PROJECT.description}</p>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              {PROJECT.previewUrl && (
                <div>
                  <p className="text-xs text-muted mb-1">Preview URL</p>
                  <a href={`https://${PROJECT.previewUrl}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-status-queued hover:text-cream transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    {PROJECT.previewUrl}
                  </a>
                </div>
              )}
              {PROJECT.productionUrl && (
                <div>
                  <p className="text-xs text-muted mb-1">Production URL</p>
                  <a href={`https://${PROJECT.productionUrl}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    {PROJECT.productionUrl}
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs text-muted mb-1">Assigned Agents</p>
                <div className="flex gap-1">
                  {PROJECT.assignedAgents.map(a => (
                    <Badge key={a} variant="muted">{a}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Created</p>
                <span className="text-xs text-cream">{formatDate(PROJECT.createdAt)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Workflow runs */}
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Workflows</span>
            <GitBranch className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            {WORKFLOW_RUNS.map((wr, idx) => (
              <div key={wr.id} className={`py-3 ${idx > 0 ? 'border-t border-border' : ''}`}>
                <p className="text-xs text-cream mb-1">{wr.templateName}</p>
                <div className="flex items-center justify-between">
                  <Badge variant={wr.status === 'completed' ? 'success' : 'warning'}>{wr.status}</Badge>
                  <span className="text-xs text-muted">{formatDate(wr.startedAt)}</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Jobs */}
        <Card className="col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Jobs</span>
            <Briefcase className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            <div className="divide-y divide-border">
              {JOBS.map(job => (
                <div key={job.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cream">{job.title}</p>
                    <p className="text-xs text-muted">{job.type.replace(/_/g, ' ')}</p>
                  </div>
                  <Badge variant={jobStatusVariant(job.status)}>{job.status}</Badge>
                  <span className="text-xs text-muted shrink-0">{formatRelative(job.updatedAt)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Deployments */}
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Deployments</span>
            <Rocket className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            {DEPLOYMENTS.map((d, idx) => (
              <div key={d.id} className={`py-3 ${idx > 0 ? 'border-t border-border' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={d.environment === 'production' ? 'gold' : 'info'}>{d.environment}</Badge>
                  <Badge variant={deploymentStatusVariant(d.status)}>{d.status}</Badge>
                </div>
                {d.url && (
                  <a href={`https://${d.url}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-muted hover:text-cream transition-colors truncate block">
                    {d.url}
                  </a>
                )}
                <p className="text-xs text-muted/60 mt-1">{formatDate(d.createdAt)}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
