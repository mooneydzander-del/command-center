import { formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface ActivityItem {
  id: string
  type: 'message' | 'job' | 'deployment' | 'workflow' | 'agent'
  title: string
  subtitle?: string
  timestamp: Date | string
  status?: string
}

const TYPE_DOT: Record<ActivityItem['type'], string> = {
  message: 'bg-gold',
  job: 'bg-status-running',
  deployment: 'bg-status-deployed',
  workflow: 'bg-status-queued',
  agent: 'bg-muted',
}

interface ActivityFeedProps {
  items: ActivityItem[]
  className?: string
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  if (items.length === 0) {
    return <p className="text-xs text-muted text-center py-6">No recent activity</p>
  }

  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={cn(
            'flex gap-3 py-3',
            idx !== items.length - 1 && 'border-b border-border'
          )}
        >
          <div className="flex flex-col items-center gap-1 pt-1">
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', TYPE_DOT[item.type])} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-cream truncate">{item.title}</p>
            {item.subtitle && <p className="text-xs text-muted truncate">{item.subtitle}</p>}
          </div>
          <span className="text-xs text-muted shrink-0">{formatRelative(item.timestamp)}</span>
        </div>
      ))}
    </div>
  )
}
