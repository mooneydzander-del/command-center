'use client'

import { useState } from 'react'
import { Plus, FolderOpen, Search } from 'lucide-react'
import Link from 'next/link'
import { Badge, projectStatusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MockProject {
  id: string
  name: string
  clientName: string
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'deployed' | 'paused'
  description: string
  previewUrl?: string
  productionUrl?: string
  updatedAt: Date
}

const MOCK_PROJECTS: MockProject[] = [
  { id: 'p1', name: 'Apex Law — v2 Site', clientName: 'Apex Law Group', status: 'in_progress', description: 'Full redesign with video background hero, dark legal aesthetic', previewUrl: 'apex-law-v2.vercel.app', updatedAt: new Date('2026-04-18') },
  { id: 'p2', name: 'Riviera — Landing Page', clientName: 'Riviera Wellness', status: 'review', description: 'Calming wellness landing page with booking flow', previewUrl: 'riviera-wellness.vercel.app', updatedAt: new Date('2026-04-17') },
  { id: 'p3', name: 'Cinematic Co — Full Build', clientName: 'Cinematic Co', status: 'deployed', description: 'Complete agency site with portfolio and contact gate', productionUrl: 'cinematic.co', updatedAt: new Date('2026-04-05') },
  { id: 'p4', name: 'Blackstone — Portfolio', clientName: 'Blackstone Group', status: 'planning', description: 'Investment portfolio showcase site', updatedAt: new Date('2026-04-20') },
  { id: 'p5', name: 'Novu Studio — Site', clientName: 'Novu Studio', status: 'completed', description: 'Architecture firm portfolio with case studies', productionUrl: 'novu.design', updatedAt: new Date('2026-03-28') },
  { id: 'p6', name: 'Apex Law — Blog Add-on', clientName: 'Apex Law Group', status: 'planning', description: 'News & insights section added to main site', updatedAt: new Date('2026-04-20') },
]

const STATUS_ORDER = ['in_progress', 'review', 'planning', 'completed', 'deployed', 'paused']

export default function ProjectsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = MOCK_PROJECTS
    .filter(p => {
      const q = query.toLowerCase()
      const matchesQuery = p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesQuery && matchesStatus
    })
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Projects</h2>
          <p className="text-xs text-muted mt-0.5">{MOCK_PROJECTS.length} total projects</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
          New Project
        </Button>
      </div>

      {/* Search + filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search projects or clients…"
            className="w-full pl-8 pr-3 py-2 text-sm bg-obsidian-800 border border-border rounded-md text-cream placeholder:text-muted focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['all', 'in_progress', 'review', 'planning', 'completed', 'deployed', 'paused'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-2 text-xs rounded-md transition-colors',
                statusFilter === s
                  ? 'bg-gold/10 text-gold border border-gold/30'
                  : 'bg-obsidian-800 text-muted border border-border hover:text-cream'
              )}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-5 h-5" />}
          title="No projects found"
          description={query ? `No results for "${query}"` : 'Create your first project to get started'}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="bg-obsidian-800 border border-border rounded-lg p-4 hover:border-gold/20 hover:bg-obsidian-700 transition-all duration-150 cursor-pointer space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-cream leading-snug">{project.name}</p>
                  <Badge variant={projectStatusVariant(project.status)} className="shrink-0">
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs text-muted leading-relaxed">{project.description}</p>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs text-muted">{project.clientName}</span>
                  <span className="text-xs text-muted">{formatDate(project.updatedAt)}</span>
                </div>
                {(project.previewUrl || project.productionUrl) && (
                  <div className="flex gap-2">
                    {project.previewUrl && (
                      <span className="text-xs text-muted/60 truncate">↗ {project.previewUrl}</span>
                    )}
                    {project.productionUrl && (
                      <span className="text-xs text-gold/60 truncate">↗ {project.productionUrl}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
