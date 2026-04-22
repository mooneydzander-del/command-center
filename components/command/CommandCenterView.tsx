'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { Zap, Briefcase } from 'lucide-react'
import { MessageBubble, type MessageData } from './MessageBubble'
import { CommandInput } from './CommandInput'
import { Badge, jobStatusVariant } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { formatRelative } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { JobStatus } from '@/lib/types'

interface JobRow {
  id: string
  title: string
  status: string
  updatedAt: Date
  project?: { name: string } | null
}

interface Props {
  initialMessages: (MessageData & { assets?: { name: string; type: string; url: string }[] })[]
  clients: { id: string; name: string }[]
  projects: { id: string; name: string; clientId: string }[]
  recentJobs: JobRow[]
}

export function CommandCenterView({ initialMessages, clients, projects, recentJobs }: Props) {
  const [messages, setMessages] = useState<MessageData[]>(
    // Ensure we have a system init message at the top
    initialMessages.length > 0
      ? initialMessages
      : [{
          id: 'sys-init',
          role: 'system',
          content: 'Command Center initialized — OpenAI Orchestrator ready',
          createdAt: new Date(),
        }]
  )
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<JobRow[]>(recentJobs)
  const [selectedClient, setSelectedClient] = useState('')
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Filter projects to selected client
  const filteredProjects = selectedClient
    ? projects.filter(p => p.clientId === selectedClient)
    : projects

  const handleSubmit = async (
    content: string,
    files: File[],
    clientId?: string,
    projectId?: string
  ) => {
    if (!content.trim() && files.length === 0) return

    // Optimistic user message
    const optimisticMsg: MessageData = {
      id: `opt-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date(),
      clientName: clients.find(c => c.id === clientId)?.name,
      projectName: projects.find(p => p.id === projectId)?.name,
    }
    setMessages(prev => [...prev, optimisticMsg])
    setLoading(true)

    try {
      // Upload attachments first if any
      let uploadedAssets: { name: string; type: string; url: string }[] = []
      if (files.length > 0) {
        uploadedAssets = await Promise.all(
          files.map(async (file) => {
            const fd = new FormData()
            fd.append('file', file)
            if (clientId) fd.append('clientId', clientId)
            if (projectId) fd.append('projectId', projectId)
            const res = await fetch('/api/assets', { method: 'POST', body: fd })
            const json = await res.json()
            return { name: file.name, type: json.data?.type ?? 'other', url: json.data?.url ?? '' }
          })
        )
      }

      // Post message to API → triggers OpenAI orchestrator
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'user',
          content,
          clientId: clientId || null,
          projectId: projectId || null,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to send command')
      }

      const { assistantMessage, jobs: newJobs } = json.data ?? {}

      // Replace optimistic message and add real ones
      setMessages(prev => [
        ...prev.filter(m => m.id !== optimisticMsg.id),
        { ...optimisticMsg, id: json.data?.message?.id ?? optimisticMsg.id, assets: uploadedAssets },
        ...(assistantMessage ? [{
          id: assistantMessage.id,
          role: 'assistant' as const,
          content: assistantMessage.content,
          createdAt: new Date(assistantMessage.createdAt),
        }] : []),
      ])

      // Update jobs sidebar
      if (newJobs?.length > 0) {
        setJobs(prev => [...newJobs.map((j: JobRow) => ({ ...j, updatedAt: new Date(j.updatedAt ?? Date.now()) })), ...prev].slice(0, 8))
        startTransition(() => router.refresh())
      }
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => m.id !== optimisticMsg.id),
        {
          id: `err-${Date.now()}`,
          role: 'system',
          content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          createdAt: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* Chat */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Zap className="w-4 h-4 text-gold" />
          <span className="text-sm font-medium text-cream">Command Interface — OpenAI Orchestrator</span>
          <span className="w-1.5 h-1.5 rounded-full bg-status-running ml-1 animate-pulse-slow" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-md bg-obsidian-700 border border-border flex items-center justify-center">
                <span className="w-3 h-3 border-2 border-border border-t-gold rounded-full animate-spin" />
              </div>
              <div className="bg-gold/5 border border-gold/15 rounded-lg px-3 py-2.5 text-sm text-muted">
                OpenAI Orchestrator is thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <CommandInput
          onSubmit={handleSubmit}
          loading={loading}
          clients={clients}
          projects={filteredProjects}
          onClientChange={setSelectedClient}
        />
      </div>

      {/* Jobs sidebar */}
      <div className="w-72 border-l border-border bg-obsidian-900 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-border">
          <span className="text-xs font-medium text-muted uppercase tracking-widest">Jobs</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {jobs.length === 0 ? (
            <p className="text-xs text-muted text-center py-6">No jobs yet — send a command to create one</p>
          ) : jobs.map(job => (
            <Card key={job.id} hoverable>
              <CardBody className="py-3">
                <div className="flex items-start gap-2 mb-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" />
                  <p className="text-xs text-cream leading-snug">{job.title}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={jobStatusVariant(job.status as JobStatus)}>
                    {job.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-muted">{formatRelative(job.updatedAt)}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <p className="text-xs text-muted text-center">Commands → OpenAI → jobs → Claude Code</p>
        </div>
      </div>
    </div>
  )
}
