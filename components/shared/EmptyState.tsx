import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}>
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-obsidian-700 border border-border flex items-center justify-center mb-4 text-muted">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-cream mb-1">{title}</p>
      {description && <p className="text-xs text-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
