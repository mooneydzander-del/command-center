import { cn } from '@/lib/utils'
import type { JobStatus, AgentStatus, ProjectStatus, ClientStatus, DeploymentStatus, WorkflowStatus } from '@/lib/types'

type BadgeVariant =
  | 'default'
  | 'gold'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple'
  | 'muted'

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-obsidian-600 text-cream border-border',
  gold: 'bg-gold/10 text-gold border-gold/30',
  success: 'bg-status-completed/10 text-status-completed border-status-completed/30',
  warning: 'bg-status-waiting/10 text-status-waiting border-status-waiting/30',
  error: 'bg-status-failed/10 text-status-failed border-status-failed/30',
  info: 'bg-status-queued/10 text-status-queued border-status-queued/30',
  purple: 'bg-status-deployed/10 text-status-deployed border-status-deployed/30',
  muted: 'bg-obsidian-700 text-muted border-border',
}

export function jobStatusVariant(status: JobStatus): BadgeVariant {
  const map: Record<JobStatus, BadgeVariant> = {
    queued: 'info',
    running: 'success',
    waiting_for_input: 'warning',
    waiting_for_approval: 'warning',
    failed: 'error',
    completed: 'success',
    deployed: 'purple',
  }
  return map[status]
}

export function agentStatusVariant(status: AgentStatus): BadgeVariant {
  const map: Record<AgentStatus, BadgeVariant> = {
    online: 'success',
    offline: 'muted',
    busy: 'warning',
    error: 'error',
  }
  return map[status]
}

export function projectStatusVariant(status: ProjectStatus): BadgeVariant {
  const map: Record<ProjectStatus, BadgeVariant> = {
    planning: 'info',
    in_progress: 'warning',
    review: 'gold',
    completed: 'success',
    deployed: 'purple',
    paused: 'muted',
  }
  return map[status]
}

export function clientStatusVariant(status: ClientStatus): BadgeVariant {
  const map: Record<ClientStatus, BadgeVariant> = {
    active: 'success',
    inactive: 'muted',
    prospect: 'gold',
  }
  return map[status]
}

export function deploymentStatusVariant(status: DeploymentStatus): BadgeVariant {
  const map: Record<DeploymentStatus, BadgeVariant> = {
    pending: 'info',
    building: 'warning',
    ready: 'success',
    error: 'error',
    cancelled: 'muted',
  }
  return map[status]
}

export function workflowStatusVariant(status: WorkflowStatus): BadgeVariant {
  const map: Record<WorkflowStatus, BadgeVariant> = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'error',
  }
  return map[status]
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border tracking-wide',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function StatusDot({ variant = 'default' }: { variant?: BadgeVariant }) {
  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-muted',
    gold: 'bg-gold',
    success: 'bg-status-completed',
    warning: 'bg-status-waiting',
    error: 'bg-status-failed',
    info: 'bg-status-queued',
    purple: 'bg-status-deployed',
    muted: 'bg-muted',
  }

  return (
    <span
      className={cn(
        'inline-block w-1.5 h-1.5 rounded-full',
        dotColors[variant],
        (variant === 'success' || variant === 'warning') && 'animate-pulse-slow'
      )}
    />
  )
}
