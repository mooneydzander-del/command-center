export interface N8nAdapter {
  triggerWorkflow(workflowName: string, data: Record<string, unknown>): Promise<{ runId: string }>
  getExecutionStatus(executionId: string): Promise<{ status: string; logs: string[] }>
  listWorkflows(): Promise<{ id: string; name: string; active: boolean }[]>
  ping(): Promise<boolean>
}

// ─── Real n8n implementation ──────────────────────────────────────────────────

// Maps template names to their n8n webhook paths (set in n8n as "Webhook" nodes)
// These must match the webhook paths configured in your n8n instance.
const WEBHOOK_PATHS: Record<string, string> = {
  'New Client Onboarding': '/webhook/client-onboarding',
  'Website Build Pipeline': '/webhook/website-build',
  'Deploy to Production': '/webhook/deploy-production',
  'Send Client Update': '/webhook/client-update',
}

function getBaseUrl(): string | null {
  return process.env.N8N_BASE_URL ?? null
}

function getHeaders(): Record<string, string> {
  const apiKey = process.env.N8N_API_KEY
  return {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-N8N-API-KEY': apiKey } : {}),
  }
}

export const n8nAdapter: N8nAdapter = {
  async triggerWorkflow(workflowName, data) {
    const baseUrl = getBaseUrl()
    if (!baseUrl) {
      console.warn('[n8n] N8N_BASE_URL not set — using mock')
      return { runId: `mock-run-${Date.now()}` }
    }

    // Use webhook path if known, otherwise try the generic webhook
    const path = (data.webhookPath as string) ?? WEBHOOK_PATHS[workflowName] ?? `/webhook/${workflowName.toLowerCase().replace(/\s+/g, '-')}`
    const url = `${baseUrl}${path}`

    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ workflowName, ...data }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`n8n webhook failed ${res.status}: ${text}`)
    }

    const json = await res.json().catch(() => ({}))
    return { runId: json.executionId ?? json.id ?? `run-${Date.now()}` }
  },

  async getExecutionStatus(executionId) {
    const baseUrl = getBaseUrl()
    if (!baseUrl) return { status: 'unknown', logs: [] }

    try {
      const res = await fetch(`${baseUrl}/api/v1/executions/${executionId}`, {
        headers: getHeaders(),
      })
      if (!res.ok) return { status: 'unknown', logs: [] }
      const json = await res.json()
      const status = json.data?.finished ? (json.data?.stoppedAt ? 'completed' : 'failed') : 'running'
      return { status, logs: [] }
    } catch {
      return { status: 'unknown', logs: [] }
    }
  },

  async listWorkflows() {
    const baseUrl = getBaseUrl()
    if (!baseUrl) {
      return Object.keys(WEBHOOK_PATHS).map((name, i) => ({ id: `wf-${i}`, name, active: true }))
    }

    try {
      const res = await fetch(`${baseUrl}/api/v1/workflows?active=true`, {
        headers: getHeaders(),
      })
      if (!res.ok) return []
      const json = await res.json()
      return (json.data ?? []).map((wf: { id: string; name: string; active: boolean }) => ({
        id: wf.id,
        name: wf.name,
        active: wf.active,
      }))
    } catch {
      return []
    }
  },

  async ping() {
    const baseUrl = getBaseUrl()
    if (!baseUrl) return false
    try {
      const res = await fetch(`${baseUrl}/api/v1/workflows?limit=1`, {
        headers: getHeaders(),
      })
      return res.ok
    } catch {
      return false
    }
  },
}
