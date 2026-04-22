'use client'

import { useState } from 'react'
import { Search, Plus, Users, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Badge, clientStatusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MockClient {
  id: string
  name: string
  niche: string
  status: 'active' | 'inactive' | 'prospect'
  email: string
  website?: string
  projectCount: number
  createdAt: Date
}

const MOCK_CLIENTS: MockClient[] = [
  { id: 'c1', name: 'Apex Law Group', niche: 'Legal', status: 'active', email: 'hello@apexlaw.com', website: 'apexlaw.com', projectCount: 2, createdAt: new Date('2026-01-10') },
  { id: 'c2', name: 'Riviera Wellness', niche: 'Health & Wellness', status: 'active', email: 'contact@riviera.co', website: 'riviera.co', projectCount: 1, createdAt: new Date('2026-02-14') },
  { id: 'c3', name: 'Cinematic Co', niche: 'Creative Agency', status: 'active', email: 'hi@cinematic.co', projectCount: 3, createdAt: new Date('2025-11-05') },
  { id: 'c4', name: 'Blackstone Group', niche: 'Finance', status: 'active', email: 'info@blackstone.io', website: 'blackstone.io', projectCount: 1, createdAt: new Date('2026-03-01') },
  { id: 'c5', name: 'Meridian Capital', niche: 'Finance', status: 'prospect', email: 'contact@meridiancap.com', projectCount: 0, createdAt: new Date('2026-04-10') },
  { id: 'c6', name: 'Vantage Dental', niche: 'Healthcare', status: 'inactive', email: 'admin@vantagedental.com', projectCount: 1, createdAt: new Date('2025-09-20') },
  { id: 'c7', name: 'Novu Studio', niche: 'Architecture', status: 'active', email: 'studio@novu.design', website: 'novu.design', projectCount: 2, createdAt: new Date('2026-01-28') },
  { id: 'c8', name: 'Solus Brands', niche: 'E-commerce', status: 'prospect', email: 'hello@solusbrands.com', projectCount: 0, createdAt: new Date('2026-04-15') },
]

export default function ClientsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = MOCK_CLIENTS.filter(c => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.niche.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Clients</h2>
          <p className="text-xs text-muted mt-0.5">{MOCK_CLIENTS.length} total clients</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
          Add Client
        </Button>
      </div>

      {/* Search + filter */}
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
                'px-3 py-2 text-xs rounded-md transition-colors capitalize',
                statusFilter === s
                  ? 'bg-gold/10 text-gold border border-gold/30'
                  : 'bg-obsidian-800 text-muted border border-border hover:text-cream'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
                    <div>
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-sm font-medium text-cream hover:text-gold transition-colors"
                      >
                        {client.name}
                      </Link>
                      <p className="text-xs text-muted">{client.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{client.niche}</td>
                  <td className="px-4 py-3">
                    <Badge variant={clientStatusVariant(client.status)} className="capitalize">
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-cream">{client.projectCount}</td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDate(client.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      {client.website && (
                        <a
                          href={`https://${client.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-obsidian-600 text-muted hover:text-cream transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Link
                        href={`/clients/${client.id}`}
                        className="px-2.5 py-1 text-xs bg-obsidian-600 border border-border rounded text-cream hover:border-gold/30 transition-colors"
                      >
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
