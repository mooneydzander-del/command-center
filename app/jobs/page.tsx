'use client'

import { useState } from 'react'
import { Briefcase, AlertCircle, RefreshCw } from 'lucide-react'
import { Badge, jobStatusVariant } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

type JobStatus = 'queued' | 'running' | 'waiting_for_input' | 'waiting_for_approval' | 'failed' | 'completed' | 'deployed'

interface MockJob {
  id: string
  title: string
  type: string
  status: JobStatus
  projectName?: string
  clientName?: string
  agentName?: string
  errorMsg?: string
  createdAt: Date
  updatedAt: Date
}

const MOCK_JOBS: MockJob[] = [
  { id: 'j1', title: 'Build landing page — Apex Law', type: 'build_site', status: 'running', projectName: 'Apex Law — v2', clientName: 'Apex Law Group', agentName: 'Claude Worker', createdAt: new Date(Date.now() - 1000 * 60 * 60), updatedAt: new Date(Date.now() - 1000 * 60 * 3) },
  { id: 'j2', title: 'Review Riviera preview', type: 'review', status: 'waiting_for_approval', projectName: 'Riviera — Landing Page', clientName: 'Riviera Wellness', agentName: 'OpenClaw', createdAt: new Date(Date.now() - 1000 * 60 * 45), updatedAt: new Date(Date.now() - 1000 * 60 * 10) },
  { id: 'j3', title: 'Revision — hero section copy', type: 'revision', status: 'queued', projectName: 'Riviera — Landing Page', clientName: 'Riviera Wellness', createdAt: new Date(Date.now() - 1000 * 60 * 20), updatedAt: new Date(Date.now() - 1000 * 60 * 20) },
  { id: 'j4', title: 'Upload video background', type: 'upload_assets', status: 'queued', projectName: 'Apex Law — v2', clientName: 'Apex Law Group', createdAt: new Date(Date.now() - 1000 * 60 * 15), updatedAt: new Date(Date.now() - 1000 * 60 * 15) },
  { id: 'j5', title: 'Asset processing failed', type: 'upload_assets', status: 'failed', projectName: 'Blackstone — Portfolio', clientName: 'Blackstone Group', errorMsg: 'File size exceeds 50MB limit', createdAt: new Date(Date.now() - 1000 * 60 * 90), updatedAt: new Date(Date.now() - 1000 * 60 * 60) },
  { id: 'j6', title: 'Deploy preview — Cinematic Co', type: 'deploy', status: 'completed', projectName: 'Cinematic Co — Full Build', clientName: 'Cinematic Co', agentName: 'Claude Worker', createdAt: new Date(Date.now() - 1000 * 60 * 120), updatedAt: new Date(Date.now() - 1000 * 60 * 90) },
  { id: 'j7', title: 'Production deploy — Novu Studio', type: 'deploy', status: 'deployed', projectName: 'Novu Studio — Site', clientName: 'Novu Studio', agentName: 'Claude Worker', createdAt: new Date('2026-04-15'), updatedAt: new Date('2026-04-15') },
  { id: 'j8', title: 'Build blog section', type: 'build_site', status: 'waiting_for_input', projectName: 'Apex Law — Blog Add-on', clientName: 'Apex Law Group', agentName: 'OpenClaw', createdAt: new Date(Date.now() - 1000 * 60 * 30), updatedAt: new Date(Date.now() - 1000 * 60 * 5) },
]

const COLUMNS: { key: JobStatus; label: string }[] = [
  { key: 'queued', label: 'Queued' },
  { key: 'running', label: 'Running' },
  { key: 'waiting_for_input', label: 'Needs Input' },
  { key: 'waiting_for_approval', label: 'Needs Approval' },
  { key: 'failed', label: 'Failed' },
  { key: 'completed', label: 'Completed' },
  { key: 'deployed', label: 'Deployed' },
]

function JobCard({ job }: { job: MockJob }) {
  return (
    <div className="bg-obsidian-800 border border-border rounded-lg p-3 hover:border-gold/20 transition-colors space-y-2">
      <div className="flex items-start gap-2">
        {job.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-status-failed shrink-0 mt-0.5" />}
        <p className="text-xs text-cream leading-snug">{job.title}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        <span className="text-xs text-muted bg-obsidian-700 px-1.5 py-0.5 rounded">{job.type.replace(/_/g, ' ')}</span>
      </div>
      {job.errorMsg && (
        <p className="text-xs text-status-failed bg-status-failed/5 border border-status-failed/20 rounded px-2 py-1">{job.errorMsg}</p>
      )}
      {job.clientName && <p className="text-xs text-muted truncate">{job.clientName}</p>}
      {job.agentName && (
        <p className="text-xs text-muted/60">via {job.agentName}</p>
      )}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-xs text-muted/60">{formatRelative(job.updatedAt)}</span>
        {job.status === 'waiting_for_approval' && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="text-xs px-2 py-0.5">Reject</Button>
            <Button variant="primary" size="sm" className="text-xs px-2 py-0.5">Approve</Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function JobsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const jobsByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = MOCK_JOBS.filter(j => j.status === col.key)
    return acc
  }, {} as Record<JobStatus, MockJob[]>)

  const activeStatuses: JobStatus[] = statusFilter === 'all'
    ? COLUMNS.map(c => c.key)
    : [statusFilter as JobStatus]

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-cream">Jobs</h2>
          <p className="text-xs text-muted mt-0.5">{MOCK_JOBS.length} total jobs</p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh
        </Button>
      </div>

      {/* Status tabs */}
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
          All ({MOCK_JOBS.length})
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

      {/* Board */}
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
                ) : (
                  jobs.map(job => <JobCard key={job.id} job={job} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
