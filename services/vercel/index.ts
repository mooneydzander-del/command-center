export interface VercelDeployment {
  id: string
  url: string
  state: string
  createdAt: number
}

export interface VercelAdapter {
  deploy(projectName: string, env: 'preview' | 'production'): Promise<VercelDeployment>
  getDeployment(deploymentId: string): Promise<VercelDeployment>
  listDeployments(projectName: string): Promise<VercelDeployment[]>
}

const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID

function vercelHeaders() {
  return {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

const realVercelAdapter: VercelAdapter = {
  async deploy(projectName, env) {
    const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
    const res = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
      method: 'POST',
      headers: vercelHeaders(),
      body: JSON.stringify({
        name: projectName,
        target: env === 'production' ? 'production' : undefined,
        source: 'api',
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message ?? 'Vercel deploy failed')
    return { id: json.id, url: json.url, state: json.readyState ?? 'BUILDING', createdAt: json.createdAt }
  },

  async getDeployment(deploymentId) {
    const teamQuery = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
    const res = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}${teamQuery}`, {
      headers: vercelHeaders(),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message ?? 'Failed to get deployment')
    return { id: json.id, url: json.url, state: json.readyState, createdAt: json.createdAt }
  },

  async listDeployments(projectName) {
    const teamQuery = VERCEL_TEAM_ID ? `&teamId=${VERCEL_TEAM_ID}` : ''
    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(projectName)}&limit=10${teamQuery}`,
      { headers: vercelHeaders() }
    )
    const json = await res.json()
    if (!res.ok) return []
    return (json.deployments ?? []).map((d: Record<string, unknown>) => ({
      id: d.uid as string,
      url: d.url as string,
      state: d.state as string,
      createdAt: d.createdAt as number,
    }))
  },
}

const mockVercelAdapter: VercelAdapter = {
  async deploy(projectName, env) {
    console.log('[Vercel Mock] deploy', { projectName, env })
    return { id: `dpl_mock_${Date.now()}`, url: `${projectName}.vercel.app`, state: 'BUILDING', createdAt: Date.now() }
  },
  async getDeployment(deploymentId) {
    return { id: deploymentId, url: 'mock-deploy.vercel.app', state: 'READY', createdAt: Date.now() }
  },
  async listDeployments() {
    return []
  },
}

export const vercelAdapter: VercelAdapter = VERCEL_TOKEN ? realVercelAdapter : mockVercelAdapter
