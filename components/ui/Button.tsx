import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-obsidian-950 hover:bg-gold-light font-medium',
  secondary: 'bg-obsidian-700 text-cream hover:bg-obsidian-600 border border-border',
  ghost: 'text-muted hover:text-cream hover:bg-obsidian-700',
  danger: 'bg-status-failed/10 text-status-failed hover:bg-status-failed/20 border border-status-failed/30',
  outline: 'border border-border text-cream hover:bg-obsidian-700',
}

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-3 py-2 gap-2',
  lg: 'text-sm px-4 py-2.5 gap-2',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-sans transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
