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

export const mockVercelAdapter: VercelAdapter = {
  async deploy(projectName, env) {
    console.log('[Vercel Mock] deploy', { projectName, env })
    return {
      id: `dpl_mock_${Date.now()}`,
      url: `https://${projectName}-${Date.now()}.vercel.app`,
      state: 'BUILDING',
      createdAt: Date.now(),
    }
  },

  async getDeployment(deploymentId) {
    return {
      id: deploymentId,
      url: `https://mock-deploy.vercel.app`,
      state: 'READY',
      createdAt: Date.now(),
    }
  },

  async listDeployments(projectName) {
    console.log('[Vercel Mock] listDeployments', projectName)
    return []
  },
}

export const vercelAdapter: VercelAdapter = mockVercelAdapter
