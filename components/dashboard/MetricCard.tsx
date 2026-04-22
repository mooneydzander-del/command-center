import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  accent?: boolean
  className?: string
}

export function MetricCard({ label, value, subtext, icon, accent, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-obsidian-800 border border-border rounded-lg p-4 flex flex-col gap-3',
        accent && 'border-gold/20',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted uppercase tracking-widest font-medium">{label}</span>
        {icon && (
          <div className={cn('w-7 h-7 rounded-md flex items-center justify-center', accent ? 'bg-gold/10 text-gold' : 'bg-obsidian-700 text-muted')}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <span className="text-2xl font-display text-cream">{value}</span>
        {subtext && <p className="text-xs text-muted mt-0.5">{subtext}</p>}
      </div>
    </div>
  )
}
