import type { AgentStatus, JobContext } from '@/lib/types'

export interface OpenClawAdapter {
  dispatch(command: string, context: JobContext): Promise<{ jobId: string }>
  getStatus(): Promise<{ status: AgentStatus; currentTask: string | null; lastHeartbeat: Date | null }>
  ping(): Promise<boolean>
}

export const mockOpenClawAdapter: OpenClawAdapter = {
  async dispatch(command, context) {
    console.log('[OpenClaw Mock] dispatch', { command, context })
    return { jobId: context.jobId }
  },

  async getStatus() {
    return {
      status: 'online' as AgentStatus,
      currentTask: null,
      lastHeartbeat: new Date(),
    }
  },

  async ping() {
    return true
  },
}

// Replace with real implementation when OpenClaw API is available
export const openClawAdapter: OpenClawAdapter = mockOpenClawAdapter
