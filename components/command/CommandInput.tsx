'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, Paperclip, X, Users, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface Attachment {
  file: File
  previewUrl?: string
}

interface CommandInputProps {
  onSubmit: (content: string, attachments: File[], clientId?: string, projectId?: string) => void
  loading?: boolean
  clients?: { id: string; name: string }[]
  projects?: { id: string; name: string }[]
  onClientChange?: (clientId: string) => void
}

export function CommandInput({ onSubmit, loading, clients = [], projects = [], onClientChange }: CommandInputProps) {
  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [value, attachments, selectedClient, selectedProject])

  const handleSubmit = () => {
    if (!value.trim() && attachments.length === 0) return
    onSubmit(
      value.trim(),
      attachments.map(a => a.file),
      selectedClient || undefined,
      selectedProject || undefined
    )
    setValue('')
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newAttachments: Attachment[] = files.map(file => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))
    setAttachments(prev => [...prev, ...newAttachments])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  return (
    <div className="border-t border-border bg-obsidian-900 p-4">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((att, i) => (
            <div
              key={i}
              className="relative flex items-center gap-1.5 bg-obsidian-700 border border-border rounded px-2 py-1"
            >
              {att.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={att.previewUrl} alt={att.file.name} className="w-5 h-5 object-cover rounded" />
              ) : null}
              <span className="text-xs text-muted max-w-32 truncate">{att.file.name}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="text-muted hover:text-cream ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Context selectors */}
      {(clients.length > 0 || projects.length > 0) && (
        <div className="flex gap-2 mb-3">
          {clients.length > 0 && (
            <div className="relative">
              <Users className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
              <select
                value={selectedClient}
                onChange={e => { setSelectedClient(e.target.value); onClientChange?.(e.target.value) }}
                className="pl-6 pr-3 py-1.5 text-xs bg-obsidian-800 border border-border rounded text-muted focus:outline-none focus:border-gold/30 appearance-none cursor-pointer"
              >
                <option value="">No client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          {projects.length > 0 && (
            <div className="relative">
              <FolderOpen className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
              <select
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                className="pl-6 pr-3 py-1.5 text-xs bg-obsidian-800 border border-border rounded text-muted focus:outline-none focus:border-gold/30 appearance-none cursor-pointer"
              >
                <option value="">No project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 bg-obsidian-800 border border-border rounded-lg flex flex-col focus-within:border-gold/30 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Command the OpenAI orchestrator… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="bg-transparent text-sm text-cream placeholder:text-muted resize-none px-3 pt-3 pb-2 focus:outline-none min-h-[42px] max-h-40"
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          icon={<Paperclip className="w-4 h-4" />}
          className="self-end mb-1"
        />

        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          loading={loading}
          disabled={!value.trim() && attachments.length === 0}
          icon={!loading ? <Send className="w-3.5 h-3.5" /> : undefined}
          className="self-end mb-1"
        />
      </div>
    </div>
  )
}
