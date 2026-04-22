import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Mail, FolderOpen, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Badge, clientStatusVariant, projectStatusVariant, jobStatusVariant } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate, formatRelative } from '@/lib/utils'
import type { JobStatus, ProjectStatus, ClientStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { jobs: true } } },
      },
      assets: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!client) notFound()

  // Jobs linked through projects
  const jobs = await prisma.job.findMany({
    where: { project: { clientId: id } },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: { agent: { select: { name: true } } },
  })

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-5xl">
      <div>
        <Link href="/clients" className="flex items-center gap-1.5 text-xs text-muted hover:text-cream transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          All Clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl text-cream">{client.name}</h2>
            <p className="text-xs text-muted mt-0.5">
              {client.niche ?? 'No niche'} · Client since {formatDate(client.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={clientStatusVariant(client.status as ClientStatus)} className="capitalize">{client.status}</Badge>
            <Button variant="primary" size="sm" icon={<FolderOpen className="w-3.5 h-3.5" />}>
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Contact info */}
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Contact Info</span>
          </CardHeader>
          <CardBody className="space-y-3">
            {client.email && (
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                <a href={`mailto:${client.email}`} className="text-cream hover:text-gold transition-colors">{client.email}</a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 text-center shrink-0 text-muted">☎</span>
                <span className="text-cream">{client.phone}</span>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2 text-xs">
                <ExternalLink className="w-3.5 h-3.5 text-muted shrink-0" />
                <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer"
                  className="text-cream hover:text-gold transition-colors">{client.website}</a>
              </div>
            )}
            {!client.email && !client.phone && !client.website && (
              <p className="text-xs text-muted">No contact info yet</p>
            )}
          </CardBody>
        </Card>

        {/* Notes */}
        <Card className="col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Notes</span>
          </CardHeader>
          <CardBody>
            {client.notes
              ? <p className="text-sm text-cream/80 leading-relaxed">{client.notes}</p>
              : <p className="text-sm text-muted italic">No notes yet</p>
            }
          </CardBody>
        </Card>

        {/* Projects */}
        <Card className="col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">
              Projects ({client.projects.length})
            </span>
            <FolderOpen className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            {client.projects.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No projects yet</p>
            ) : (
              <div className="divide-y divide-border">
                {client.projects.map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/projects/${p.id}`} className="text-sm text-cream hover:text-gold transition-colors">
                        {p.name}
                      </Link>
                      {p.description && <p className="text-xs text-muted truncate">{p.description}</p>}
                    </div>
                    <Badge variant={projectStatusVariant(p.status as ProjectStatus)}>{p.status.replace(/_/g, ' ')}</Badge>
                    <span className="text-xs text-muted shrink-0">{formatDate(p.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent jobs */}
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Recent Jobs</span>
            <Briefcase className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            {jobs.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No jobs yet</p>
            ) : (
              <div className="divide-y divide-border">
                {jobs.map(j => (
                  <div key={j.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-cream">{j.title}</p>
                      <p className="text-xs text-muted">{j.type.replace(/_/g, ' ')}</p>
                    </div>
                    <Badge variant={jobStatusVariant(j.status as JobStatus)}>{j.status.replace(/_/g, ' ')}</Badge>
                    <span className="text-xs text-muted/60 shrink-0">{formatRelative(j.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
