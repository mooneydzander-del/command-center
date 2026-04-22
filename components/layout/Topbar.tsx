'use client'

import { usePathname } from 'next/navigation'
import { Menu, Search } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/command': 'Command Center',
  '/clients': 'Clients',
  '/projects': 'Projects',
  '/jobs': 'Jobs',
  '/workers': 'Workers',
  '/workflows': 'Workflows',
  '/deployments': 'Deployments',
  '/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const base = '/' + pathname.split('/')[1]
  return PAGE_TITLES[base] ?? 'Command Center'
}

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="h-14 border-b border-border bg-obsidian-900 flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={onMenuClick}
        className="text-muted hover:text-cream transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>

      <h1 className="text-sm font-medium text-cream tracking-wide">{title}</h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search clients, projects…"
          className="pl-8 pr-3 py-1.5 text-xs bg-obsidian-800 border border-border rounded-md text-cream placeholder:text-muted focus:outline-none focus:border-gold/40 w-52 transition-colors"
        />
      </div>

      {/* Status dot */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-status-running animate-pulse-slow" />
        <span>System online</span>
      </div>
    </header>
  )
}
