'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Terminal,
  Users,
  FolderOpen,
  Briefcase,
  Bot,
  GitBranch,
  Rocket,
  Settings,
  ChevronLeft,
  Zap,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Command', href: '/command', icon: Terminal },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Workers', href: '/workers', icon: Bot },
  { label: 'Workflows', href: '/workflows', icon: GitBranch },
  { label: 'Deployments', href: '/deployments', icon: Rocket },
]

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-obsidian-900 transition-all duration-300 shrink-0',
        open ? 'w-56' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-border h-14',
        open ? 'px-4 gap-3' : 'justify-center'
      )}>
        <div className="w-7 h-7 rounded bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
          <Zap className="w-3.5 h-3.5 text-gold" />
        </div>
        {open && (
          <span className="font-display text-base text-cream tracking-wide">Cinema</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-all duration-150 group',
                active
                  ? 'bg-gold/10 text-gold'
                  : 'text-muted hover:text-cream hover:bg-obsidian-700'
              )}
              title={!open ? label : undefined}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-gold' : 'text-muted group-hover:text-cream')} />
              {open && <span className="font-sans tracking-wide">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-2 py-4 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-all duration-150 group',
            pathname === '/settings'
              ? 'bg-gold/10 text-gold'
              : 'text-muted hover:text-cream hover:bg-obsidian-700'
          )}
          title={!open ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {open && <span>Settings</span>}
        </Link>

        <button
          onClick={onToggle}
          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-muted hover:text-cream hover:bg-obsidian-700 transition-all duration-150 w-full"
          title={open ? 'Collapse' : 'Expand'}
        >
          <ChevronLeft className={cn('w-4 h-4 shrink-0 transition-transform duration-300', !open && 'rotate-180')} />
          {open && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
