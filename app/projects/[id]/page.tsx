import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Briefcase, GitBranch, Rocket } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Badge, projectStatusVariant, jobStatusVariant, deploymentStatusVariant } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { formatDate, formatRelative } from '@/lib/utils'
import type { JobStatus, ProjectStatus, DeploymentStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      jobs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { agent: { select: { name: true } } },
      },
      deployments: { orderBy: { createdAt: 'desc' }, take: 5 },
      workflowRuns: { orderBy: { createdAt: 'desc' }, take: 5 },
      assets: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!project) notFound()

  // Agents assigned to jobs on this project
  const assignedAgentNames = [...new Set(
    project.jobs.flatMap(j => j.agent?.name ? [j.agent.name] : [])
  )]

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-6xl">
      <div>
        <Link href={`/clients/${project.client.id}`} className="flex items-center gap-1.5 text-xs text-muted hover:text-cream transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          {project.client.name}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl text-cream">{project.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Link href={`/clients/${project.client.id}`} className="text-xs text-muted hover:text-gold transition-colors">
                {project.client.name}
              </Link>
              <span className="text-muted/40">·</span>
              <span className="text-xs text-muted">{formatDate(project.updatedAt)}</span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Badge variant={projectStatusVariant(project.status as ProjectStatus)}>{project.status.replace(/_/g, ' ')}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Overview */}
        <Card className="col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Overview</span>
          </CardHeader>
          <CardBody className="space-y-4">
            {project.description
              ? <p className="text-sm text-cream/80 leading-relaxed">{project.description}</p>
              : <p className="text-sm text-muted italic">No description yet</p>
            }
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              {project.previewUrl && (
                <div>
                  <p className="text-xs text-muted mb-1">Preview URL</p>
                  <a href={`https://${project.previewUrl}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-status-queued hover:text-cream transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    {project.previewUrl}
                  </a>
                </div>
              )}
              {project.productionUrl && (
                <div>
                  <p className="text-xs text-muted mb-1">Production URL</p>
                  <a href={`https://${project.productionUrl}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    {project.productionUrl}
                  </a>
                </div>
              )}
              {assignedAgentNames.length > 0 && (
                <div>
                  <p className="text-xs text-muted mb-1">Workers Used</p>
                  <div className="flex gap-1 flex-wrap">
                    {assignedAgentNames.map(a => (
                      <Badge key={a} variant="muted">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-muted mb-1">Created</p>
                <span className="text-xs text-cream">{formatDate(project.createdAt)}</span>
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
            {project.workflowRuns.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No workflow runs</p>
            ) : project.workflowRuns.map((wr, idx) => (
              <div key={wr.id} className={`py-3 ${idx > 0 ? 'border-t border-border' : ''}`}>
                <p className="text-xs text-cream mb-1">{wr.templateName}</p>
                <div className="flex items-center justify-between">
                  <Badge variant={wr.status === 'completed' ? 'success' : wr.status === 'running' ? 'warning' : wr.status === 'failed' ? 'error' : 'info'}>
                    {wr.status}
                  </Badge>
                  <span className="text-xs text-muted">{wr.startedAt ? formatDate(wr.startedAt) : '—'}</span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Jobs */}
        <Card className="col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Jobs ({project.jobs.length})</span>
            <Briefcase className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            {project.jobs.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No jobs yet</p>
            ) : (
              <div className="divide-y divide-border">
                {project.jobs.map(job => (
                  <div key={job.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-cream">{job.title}</p>
                      <p className="text-xs text-muted">{job.type.replace(/_/g, ' ')}{job.agent ? ` · ${job.agent.name}` : ''}</p>
                    </div>
                    <Badge variant={jobStatusVariant(job.status as JobStatus)}>{job.status.replace(/_/g, ' ')}</Badge>
                    <span className="text-xs text-muted shrink-0">{formatRelative(job.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Deployments */}
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Deployments</span>
            <Rocket className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            {project.deployments.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No deployments yet</p>
            ) : project.deployments.map((d, idx) => (
              <div key={d.id} className={`py-3 ${idx > 0 ? 'border-t border-border' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={d.environment === 'production' ? 'gold' : 'info'}>{d.environment}</Badge>
                  <Badge variant={deploymentStatusVariant(d.status as DeploymentStatus)}>{d.status}</Badge>
                </div>
                {d.url && (
                  <a href={`https://${d.url}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-muted hover:text-cream transition-colors truncate block">{d.url}</a>
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
