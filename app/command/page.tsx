'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageBubble, type MessageData } from '@/components/command/MessageBubble'
import { CommandInput } from '@/components/command/CommandInput'
import { Badge, jobStatusVariant } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { formatRelative } from '@/lib/utils'
import { Briefcase, Zap } from 'lucide-react'

const MOCK_CLIENTS = [
  { id: 'c1', name: 'Apex Law Group' },
  { id: 'c2', name: 'Riviera Wellness' },
  { id: 'c3', name: 'Cinematic Co' },
  { id: 'c4', name: 'Blackstone Group' },
]

const MOCK_PROJECTS = [
  { id: 'p1', name: 'Apex Law — v2 Site' },
  { id: 'p2', name: 'Riviera — Landing Page' },
  { id: 'p3', name: 'Cinematic Co — Full Build' },
]

const INITIAL_MESSAGES: MessageData[] = [
  {
    id: 'sys-1',
    role: 'system',
    content: 'Command Center initialized — OpenAI Orchestrator ready',
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'm1',
    role: 'user',
    content: 'Build a new cinematic landing page for Apex Law Group. Use a dark legal aesthetic, gold accents, and a video background hero.',
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
    clientName: 'Apex Law Group',
    projectName: 'Apex Law — v2 Site',
  },
  {
    id: 'm2',
    role: 'assistant',
    content: 'Understood. I\'ve classified this as a build_site command and created a coding job for Apex Law Group\'s v2 site:\n\n• Dark legal aesthetic with gold accent system\n• Full-screen video background hero\n• Sections: Hero → Practice Areas → About → Contact\n• Cinematic scroll animations\n\nJob queued — Claude Code Worker will pick this up and execute. I\'ll update you when the preview is ready.',
    createdAt: new Date(Date.now() - 1000 * 60 * 7),
  },
]

const MOCK_LINKED_JOBS = [
  { id: 'j1', title: 'Build landing page — Apex Law', status: 'running' as const, updatedAt: new Date(Date.now() - 1000 * 60 * 3) },
  { id: 'j2', title: 'Deploy preview — Cinematic Co', status: 'completed' as const, updatedAt: new Date(Date.now() - 1000 * 60 * 20) },
  { id: 'j3', title: 'Revision — Riviera Wellness', status: 'queued' as const, updatedAt: new Date(Date.now() - 1000 * 60 * 35) },
]

export default function CommandPage() {
  const [messages, setMessages] = useState<MessageData[]>(INITIAL_MESSAGES)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (
    content: string,
    _files: File[],
    clientId?: string,
    projectId?: string
  ) => {
    const clientName = MOCK_CLIENTS.find(c => c.id === clientId)?.name
    const projectName = MOCK_PROJECTS.find(p => p.id === projectId)?.name

    const userMsg: MessageData = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date(),
      clientName,
      projectName,
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Mock response — replace with real API call in Phase 2
    await new Promise(r => setTimeout(r, 1200))
    const assistantMsg: MessageData = {
      id: `msg-${Date.now()}-r`,
      role: 'assistant',
      content: `Received your command${clientName ? ` for ${clientName}` : ''}. I've classified it and queued the appropriate coding jobs for Claude Code Worker. Stand by for updates.`,
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, assistantMsg])
    setLoading(false)
  }

  return (
    <div className="flex h-full">
      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Zap className="w-4 h-4 text-gold" />
          <span className="text-sm font-medium text-cream">Command Interface — OpenAI Orchestrator</span>
          <span className="w-1.5 h-1.5 rounded-full bg-status-running ml-1 animate-pulse-slow" />
        </div>

        {/* Messages */}
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

        {/* Input */}
        <CommandInput
          onSubmit={handleSubmit}
          loading={loading}
          clients={MOCK_CLIENTS}
          projects={MOCK_PROJECTS}
        />
      </div>

      {/* Sidebar: linked jobs */}
      <div className="w-72 border-l border-border bg-obsidian-900 flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-border">
          <span className="text-xs font-medium text-muted uppercase tracking-widest">Active Jobs</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {MOCK_LINKED_JOBS.map(job => (
            <Card key={job.id} hoverable>
              <CardBody className="py-3">
                <div className="flex items-start gap-2 mb-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" />
                  <p className="text-xs text-cream leading-snug">{job.title}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={jobStatusVariant(job.status)}>{job.status}</Badge>
                  <span className="text-xs text-muted">{formatRelative(job.updatedAt)}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <p className="text-xs text-muted text-center">
            Commands create jobs automatically
          </p>
        </div>
      </div>
    </div>
  )
}
