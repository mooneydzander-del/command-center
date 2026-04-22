import { ArrowLeft, ExternalLink, Mail, FolderOpen, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { Badge, clientStatusVariant, projectStatusVariant } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

// Mock data — replace with DB lookup in Phase 2
const CLIENT = {
  id: 'c1',
  name: 'Apex Law Group',
  niche: 'Legal',
  status: 'active' as const,
  email: 'hello@apexlaw.com',
  phone: '+1 (212) 555-0190',
  website: 'apexlaw.com',
  notes: 'Premium law firm in Manhattan. Specializes in corporate litigation and M&A. Very specific brand standards — dark navy and gold only. CEO is Robert Crane.',
  createdAt: new Date('2026-01-10'),
}

const PROJECTS = [
  { id: 'p1', name: 'Apex Law — v2 Site', status: 'in_progress' as const, description: 'Full redesign with video background hero', updatedAt: new Date('2026-04-18') },
  { id: 'p2', name: 'Apex Law — Blog Add-on', status: 'planning' as const, description: 'Add a news/insights section', updatedAt: new Date('2026-04-20') },
]

const JOBS = [
  { id: 'j1', title: 'Build landing page', status: 'running' as const, type: 'build_site', updatedAt: new Date(Date.now() - 1000 * 60 * 3) },
  { id: 'j2', title: 'Upload brand assets', status: 'completed' as const, type: 'upload_assets', updatedAt: new Date('2026-04-16') },
]

export default function ClientDetailPage() {
  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-5xl">
      {/* Back + header */}
      <div>
        <Link href="/clients" className="flex items-center gap-1.5 text-xs text-muted hover:text-cream transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          All Clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl text-cream">{CLIENT.name}</h2>
            <p className="text-xs text-muted mt-0.5">{CLIENT.niche} · Client since {formatDate(CLIENT.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={clientStatusVariant(CLIENT.status)} className="capitalize">{CLIENT.status}</Badge>
            <Button variant="primary" size="sm" icon={<FolderOpen className="w-3.5 h-3.5" />}>
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Client info */}
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Contact Info</span>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
              <a href={`mailto:${CLIENT.email}`} className="text-cream hover:text-gold transition-colors">{CLIENT.email}</a>
            </div>
            {CLIENT.phone && (
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 text-muted text-center shrink-0">☎</span>
                <span className="text-cream">{CLIENT.phone}</span>
              </div>
            )}
            {CLIENT.website && (
              <div className="flex items-center gap-2 text-xs">
                <ExternalLink className="w-3.5 h-3.5 text-muted shrink-0" />
                <a
                  href={`https://${CLIENT.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream hover:text-gold transition-colors"
                >
                  {CLIENT.website}
                </a>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Notes */}
        <Card className="col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Notes</span>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-cream/80 leading-relaxed">{CLIENT.notes}</p>
          </CardBody>
        </Card>

        {/* Projects */}
        <Card className="col-span-2">
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Projects</span>
            <FolderOpen className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            <div className="divide-y divide-border">
              {PROJECTS.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/projects/${p.id}`} className="text-sm text-cream hover:text-gold transition-colors">
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted">{p.description}</p>
                  </div>
                  <Badge variant={projectStatusVariant(p.status)}>{p.status.replace('_', ' ')}</Badge>
                  <span className="text-xs text-muted shrink-0">{formatDate(p.updatedAt)}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Jobs */}
        <Card>
          <CardHeader>
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Recent Jobs</span>
            <Briefcase className="w-3.5 h-3.5 text-muted" />
          </CardHeader>
          <CardBody className="py-0">
            <div className="divide-y divide-border">
              {JOBS.map(j => (
                <div key={j.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-cream">{j.title}</p>
                    <p className="text-xs text-muted">{j.type.replace('_', ' ')}</p>
                  </div>
                  <Badge variant={j.status === 'running' ? 'success' : 'muted'}>{j.status}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
