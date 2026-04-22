import type { AgentStatus } from '@/lib/types'

export interface AntigravityAdapter {
  sync(data: Record<string, unknown>): Promise<void>
  getStatus(): Promise<{ status: AgentStatus; lastSync: Date | null }>
  ping(): Promise<boolean>
}

export const mockAntigravityAdapter: AntigravityAdapter = {
  async sync(data) {
    console.log('[Antigravity Mock] sync', data)
  },

  async getStatus() {
    return { status: 'offline' as AgentStatus, lastSync: null }
  },

  async ping() {
    return false
  },
}

export const antigravityAdapter: AntigravityAdapter = mockAntigravityAdapter
