import type { AgentStatus, JobContext } from '@/lib/types'

export interface ClaudeWorkerAdapter {
  submitJob(context: JobContext): Promise<void>
  getStatus(): Promise<{ status: AgentStatus; currentTask: string | null; lastHeartbeat: Date | null }>
  ping(): Promise<boolean>
}

export const mockClaudeWorkerAdapter: ClaudeWorkerAdapter = {
  async submitJob(context) {
    console.log('[Claude Worker Mock] submitJob', context)
  },

  async getStatus() {
    return {
      status: 'online' as AgentStatus,
      currentTask: 'Idle — waiting for jobs',
      lastHeartbeat: new Date(),
    }
  },

  async ping() {
    return true
  },
}

export const claudeWorkerAdapter: ClaudeWorkerAdapter = mockClaudeWorkerAdapter
