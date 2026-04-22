'use client'

import { useState, useTransition } from 'react'
import { Briefcase, AlertCircle, RefreshCw } from 'lucide-react'
import { Badge, jobStatusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { JobStatus } from '@/lib/types'

export interface JobRow {
  id: string
  title: string
  type: string
  status: string
  errorMsg: string | null
  priority: number
  updatedAt: Date
  createdAt: Date
  project?: { name: string; client: { name: string } } | null
  agent?: { name: string } | null
}

const COLUMNS: { key: JobStatus; label: string }[] = [
  { key: 'queued', label: 'Queued' },
  { key: 'running', label: 'Running' },
  { key: 'waiting_for_input', label: 'Needs Input' },
  { key: 'waiting_for_approval', label: 'Needs Approval' },
  { key: 'failed', label: 'Failed' },
  { key: 'completed', label: 'Completed' },
  { key: 'deployed', label: 'Deployed' },
]

function JobCard({ job, onApprove, onReject }: { job: JobRow; onApprove?: () => void; onReject?: () => void }) {
  return (
    <div className="bg-obsidian-800 border border-border rounded-lg p-3 hover:border-gold/20 transition-colors space-y-2">
      <div className="flex items-start gap-2">
        {job.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-status-failed shrink-0 mt-0.5" />}
        <p className="text-xs text-cream leading-snug">{job.title}</p>
      </div>
      <span className="text-xs text-muted bg-obsidian-700 px-1.5 py-0.5 rounded inline-block">
        {job.type.replace(/_/g, ' ')}
      </span>
      {job.errorMsg && (
        <p className="text-xs text-status-failed bg-status-failed/5 border border-status-failed/20 rounded px-2 py-1">
          {job.errorMsg}
        </p>
      )}
      {job.project && (
        <p className="text-xs text-muted truncate">{job.project.client.name}</p>
      )}
      {job.agent && <p className="text-xs text-muted/60">via {job.agent.name}</p>}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-xs text-muted/60">{formatRelative(job.updatedAt)}</span>
        {job.status === 'waiting_for_approval' && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onReject} className="text-xs px-2 py-0.5">Reject</Button>
            <Button variant="primary" size="sm" onClick={onApprove} className="text-xs px-2 py-0.5">Approve</Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface JobsViewProps {
  initialJobs: JobRow[]
}

export function JobsView({ initialJobs }: JobsViewProps) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const jobsByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = initialJobs.filter(j => j.status === col.key)
    return acc
  }, {} as Record<JobStatus, JobRow[]>)

  const activeStatuses: JobStatus[] = statusFilter === 'all'
    ? COLUMNS.map(c => c.key)
    : [statusFilter as JobStatus]

  const handleApproval = async (jobId: string, action: 'approved' | 'rejected') => {
    await fetch(`/api/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action === 'approved' ? 'running' : 'failed' }),
    })
    startTransition(() => router.refresh())
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Jobs</h2>
          <p className="text-xs text-muted mt-0.5">{initialJobs.length} total jobs</p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw className={cn('w-3.5 h-3.5', isPending && 'animate-spin')} />}
          onClick={() => startTransition(() => router.refresh())}>
          Refresh
        </Button>
      </div>

      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={cn(
            'px-3 py-1.5 text-xs rounded-md transition-colors border',
            statusFilter === 'all'
              ? 'bg-gold/10 text-gold border-gold/30'
              : 'bg-obsidian-800 text-muted border-border hover:text-cream'
          )}
        >
          All ({initialJobs.length})
        </button>
        {COLUMNS.map(col => (
          <button
            key={col.key}
            onClick={() => setStatusFilter(col.key)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-md transition-colors border',
              statusFilter === col.key
                ? 'bg-gold/10 text-gold border-gold/30'
                : 'bg-obsidian-800 text-muted border-border hover:text-cream'
            )}
          >
            {col.label} ({jobsByStatus[col.key].length})
          </button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {activeStatuses.map(status => {
          const col = COLUMNS.find(c => c.key === status)!
          const jobs = jobsByStatus[status]
          return (
            <div key={status} className="min-w-64 w-64 shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={jobStatusVariant(status)}>{col.label}</Badge>
                <span className="text-xs text-muted">{jobs.length}</span>
              </div>
              <div className="space-y-2">
                {jobs.length === 0 ? (
                  <EmptyState
                    icon={<Briefcase className="w-4 h-4" />}
                    title="No jobs"
                    className="py-8 bg-obsidian-900 border border-border rounded-lg"
                  />
                ) : jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApprove={() => handleApproval(job.id, 'approved')}
                    onReject={() => handleApproval(job.id, 'rejected')}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
