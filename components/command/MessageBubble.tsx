import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
import { Bot, User, FileText, Image, Film } from 'lucide-react'

export interface MessageData {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date | string
  clientName?: string
  projectName?: string
  assets?: { name: string; type: string; url: string }[]
}

const ASSET_ICON = {
  image: Image,
  video: Film,
  document: FileText,
  other: FileText,
}

export function MessageBubble({ message }: { message: MessageData }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-muted bg-obsidian-800 border border-border px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5',
        isUser ? 'bg-gold/10 border border-gold/30' : 'bg-obsidian-700 border border-border'
      )}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-gold" />
          : <Bot className="w-3.5 h-3.5 text-muted" />
        }
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1 max-w-[70%]', isUser && 'items-end')}>
        {/* Context tags */}
        {(message.clientName || message.projectName) && (
          <div className={cn('flex gap-1.5', isUser && 'flex-row-reverse')}>
            {message.clientName && (
              <span className="text-xs bg-gold/5 border border-gold/20 text-gold/70 px-2 py-0.5 rounded">
                {message.clientName}
              </span>
            )}
            {message.projectName && (
              <span className="text-xs bg-obsidian-700 border border-border text-muted px-2 py-0.5 rounded">
                {message.projectName}
              </span>
            )}
          </div>
        )}

        <div className={cn(
          'rounded-lg px-3 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-obsidian-700 border border-border text-cream'
            : 'bg-gold/5 border border-gold/15 text-cream'
        )}>
          {message.content}
        </div>

        {/* Attachments */}
        {message.assets && message.assets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.assets.map((asset, i) => {
              const Icon = ASSET_ICON[asset.type as keyof typeof ASSET_ICON] ?? FileText
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-obsidian-700 border border-border rounded px-2 py-1"
                >
                  <Icon className="w-3 h-3 text-muted" />
                  <span className="text-xs text-muted truncate max-w-32">{asset.name}</span>
                </div>
              )
            })}
          </div>
        )}

        <span className="text-xs text-muted/60">{formatDateTime(message.createdAt)}</span>
      </div>
    </div>
  )
}
