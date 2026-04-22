import type { AgentStatus, JobContext } from '@/lib/types'

export interface ClaudeWorkerAdapter {
  submitJob(context: JobContext & { title: string; type: string; description?: string }): Promise<void>
  getStatus(): Promise<{ status: AgentStatus; currentTask: string | null; lastHeartbeat: Date | null }>
  ping(): Promise<boolean>
}

function getWorkerUrl(): string | null {
  return process.env.CLAUDE_WORKER_API_URL ?? null
}

function getWorkerHeaders(): Record<string, string> {
  const apiKey = process.env.CLAUDE_WORKER_API_KEY
  return {
    'Content-Type': 'application/json',
    ...(apiKey && apiKey !== 'change_this_to_a_real_secret' ? { Authorization: `Bearer ${apiKey}` } : {}),
  }
}

export const claudeWorkerAdapter: ClaudeWorkerAdapter = {
  async submitJob(context) {
    const workerUrl = getWorkerUrl()
    if (!workerUrl) {
      console.warn('[Claude Worker] CLAUDE_WORKER_API_URL not set — job will be picked up via polling')
      return
    }

    try {
      const res = await fetch(`${workerUrl}/jobs`, {
        method: 'POST',
        headers: getWorkerHeaders(),
        body: JSON.stringify(context),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error(`[Claude Worker] submitJob failed ${res.status}: ${text}`)
      }
    } catch (err) {
      // Worker may be offline — job is in DB and worker polls for it
      console.warn('[Claude Worker] submitJob network error (worker may poll DB directly):', err)
    }
  },

  async getStatus() {
    const workerUrl = getWorkerUrl()
    if (!workerUrl) {
      return { status: 'offline' as AgentStatus, currentTask: null, lastHeartbeat: null }
    }

    try {
      const res = await fetch(`${workerUrl}/status`, {
        headers: getWorkerHeaders(),
        signal: AbortSignal.timeout(3000),
      })
      if (!res.ok) return { status: 'error' as AgentStatus, currentTask: null, lastHeartbeat: null }
      const json = await res.json()
      return {
        status: (json.status as AgentStatus) ?? 'online',
        currentTask: json.currentTask ?? null,
        lastHeartbeat: json.lastHeartbeat ? new Date(json.lastHeartbeat) : new Date(),
      }
    } catch {
      return { status: 'offline' as AgentStatus, currentTask: null, lastHeartbeat: null }
    }
  },

  async ping() {
    const status = await claudeWorkerAdapter.getStatus()
    return status.status === 'online' || status.status === 'busy'
  },
}
