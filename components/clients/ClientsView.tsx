'use client'

import { useState } from 'react'
import { Search, Plus, Users, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Badge, clientStatusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface ClientRow {
  id: string
  name: string
  niche: string | null
  status: string
  email: string | null
  website: string | null
  createdAt: Date
  _count: { projects: number }
}

interface ClientsViewProps {
  initialClients: ClientRow[]
}

export function ClientsView({ initialClients }: ClientsViewProps) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = initialClients.filter(c => {
    const q = query.toLowerCase()
    const matchesQuery =
      c.name.toLowerCase().includes(q) ||
      (c.niche ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Clients</h2>
          <p className="text-xs text-muted mt-0.5">{initialClients.length} total clients</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
          Add Client
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, niche, or email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-obsidian-800 border border-border rounded-md text-cream placeholder:text-muted focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'prospect', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-2 text-xs rounded-md transition-colors capitalize border',
                statusFilter === s
                  ? 'bg-gold/10 text-gold border-gold/30'
                  : 'bg-obsidian-800 text-muted border-border hover:text-cream'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-5 h-5" />}
          title="No clients found"
          description={query ? `No results for "${query}"` : 'Add your first client to get started'}
        />
      ) : (
        <div className="bg-obsidian-800 border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Niche</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Projects</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-widest">Since</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((client, idx) => (
                <tr
                  key={client.id}
                  className={cn(
                    'hover:bg-obsidian-700 transition-colors group',
                    idx !== filtered.length - 1 && 'border-b border-border'
                  )}
                >
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="text-sm font-medium text-cream hover:text-gold transition-colors">
                      {client.name}
                    </Link>
                    {client.email && <p className="text-xs text-muted">{client.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{client.niche ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={clientStatusVariant(client.status as 'active' | 'inactive' | 'prospect')} className="capitalize">
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-cream">{client._count.projects}</td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(client.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      {client.website && (
                        <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-obsidian-600 text-muted hover:text-cream transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Link href={`/clients/${client.id}`}
                        className="px-2.5 py-1 text-xs bg-obsidian-600 border border-border rounded text-cream hover:border-gold/30 transition-colors">
                        View
                      </Link>
                    </div>
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
