export interface N8nAdapter {
  triggerWorkflow(workflowName: string, data: Record<string, unknown>): Promise<{ runId: string }>
  getRunStatus(runId: string): Promise<{ status: string; logs: string[] }>
  listWorkflows(): Promise<{ id: string; name: string }[]>
}

export const mockN8nAdapter: N8nAdapter = {
  async triggerWorkflow(workflowName, data) {
    console.log('[n8n Mock] triggerWorkflow', { workflowName, data })
    return { runId: `mock-run-${Date.now()}` }
  },

  async getRunStatus(runId) {
    console.log('[n8n Mock] getRunStatus', runId)
    return { status: 'completed', logs: ['Workflow completed successfully'] }
  },

  async listWorkflows() {
    return [
      { id: 'wf-1', name: 'New Client Onboarding' },
      { id: 'wf-2', name: 'Website Build Pipeline' },
      { id: 'wf-3', name: 'Deploy to Production' },
      { id: 'wf-4', name: 'Send Client Update' },
    ]
  },
}

export const n8nAdapter: N8nAdapter = mockN8nAdapter
