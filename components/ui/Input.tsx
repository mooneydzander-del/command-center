import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-obsidian-900 border border-border rounded-md text-sm text-cream placeholder:text-muted',
              'focus:outline-none focus:border-gold/40 transition-colors px-3 py-2',
              icon && 'pl-8',
              error && 'border-status-failed/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-status-failed">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-obsidian-900 border border-border rounded-md text-sm text-cream placeholder:text-muted',
            'focus:outline-none focus:border-gold/40 transition-colors px-3 py-2 resize-none',
            error && 'border-status-failed/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-status-failed">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
