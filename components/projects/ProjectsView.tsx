'use client'

import { useState } from 'react'
import { Plus, FolderOpen, Search } from 'lucide-react'
import Link from 'next/link'
import { Badge, projectStatusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/lib/types'

export interface ProjectRow {
  id: string
  name: string
  status: string
  description: string | null
  previewUrl: string | null
  productionUrl: string | null
  updatedAt: Date
  client: { name: string }
}

interface ProjectsViewProps {
  initialProjects: ProjectRow[]
}

const STATUS_ORDER = ['in_progress', 'review', 'planning', 'completed', 'deployed', 'paused']

export function ProjectsView({ initialProjects }: ProjectsViewProps) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = initialProjects
    .filter(p => {
      const q = query.toLowerCase()
      return (
        (p.name.toLowerCase().includes(q) || p.client.name.toLowerCase().includes(q)) &&
        (statusFilter === 'all' || p.status === statusFilter)
      )
    })
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Projects</h2>
          <p className="text-xs text-muted mt-0.5">{initialProjects.length} total projects</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>New Project</Button>
      </div>

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
                'px-3 py-2 text-xs rounded-md transition-colors border',
                statusFilter === s
                  ? 'bg-gold/10 text-gold border-gold/30'
                  : 'bg-obsidian-800 text-muted border-border hover:text-cream'
              )}
            >
              {s.replace(/_/g, ' ')}
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
                  <Badge variant={projectStatusVariant(project.status as ProjectStatus)} className="shrink-0">
                    {project.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {project.description && (
                  <p className="text-xs text-muted leading-relaxed">{project.description}</p>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs text-muted">{project.client.name}</span>
                  <span className="text-xs text-muted">{formatDate(project.updatedAt)}</span>
                </div>
                {(project.previewUrl || project.productionUrl) && (
                  <div className="flex gap-2">
                    {project.previewUrl && <span className="text-xs text-muted/60 truncate">↗ {project.previewUrl}</span>}
                    {project.productionUrl && <span className="text-xs text-gold/60 truncate">↗ {project.productionUrl}</span>}
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
