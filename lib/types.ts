// ─── Enums ────────────────────────────────────────────────────────────────────

export type ClientStatus = 'active' | 'inactive' | 'prospect'

export type ProjectStatus =
  | 'planning'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'deployed'
  | 'paused'

export type JobStatus =
  | 'queued'
  | 'running'
  | 'waiting_for_input'
  | 'waiting_for_approval'
  | 'failed'
  | 'completed'
  | 'deployed'

export type AgentType = 'openai_orchestrator' | 'claude_worker' | 'antigravity' | 'n8n'
export type AgentStatus = 'online' | 'offline' | 'busy' | 'error'

export type MessageRole = 'user' | 'assistant' | 'system'

export type AssetType = 'image' | 'video' | 'document' | 'other'

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed'

export type DeploymentEnvironment = 'preview' | 'production'
export type DeploymentStatus = 'pending' | 'building' | 'ready' | 'error' | 'cancelled'
export type ApprovalState = 'not_required' | 'pending' | 'approved' | 'rejected'

// ─── DB Row types (matches Prisma models) ────────────────────────────────────

export interface Client {
  id: string
  name: string
  niche: string | null
  status: ClientStatus
  notes: string | null
  email: string | null
  phone: string | null
  website: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  clientId: string
  status: ProjectStatus
  description: string | null
  previewUrl: string | null
  productionUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Job {
  id: string
  projectId: string | null
  agentId: string | null
  type: string
  status: JobStatus
  title: string
  description: string | null
  payload: string | null
  result: string | null
  errorMsg: string | null
  priority: number
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

export interface Agent {
  id: string
  name: string
  type: AgentType
  status: AgentStatus
  currentTask: string | null
  lastHeartbeat: Date | null
  errorState: string | null
  metadata: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  clientId: string | null
  projectId: string | null
  metadata: string | null
  createdAt: Date
}

export interface ProjectAsset {
  id: string
  projectId: string | null
  clientId: string | null
  messageId: string | null
  name: string
  url: string
  type: AssetType
  size: number | null
  mimeType: string | null
  createdAt: Date
}

export interface WorkflowRun {
  id: string
  templateName: string
  status: WorkflowStatus
  clientId: string | null
  projectId: string | null
  n8nRunId: string | null
  logsJson: string | null
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Deployment {
  id: string
  projectId: string
  environment: DeploymentEnvironment
  status: DeploymentStatus
  url: string | null
  approvalState: ApprovalState
  approvedBy: string | null
  vercelId: string | null
  commitSha: string | null
  createdAt: Date
  updatedAt: Date
  readyAt: Date | null
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ─── Dashboard metric ─────────────────────────────────────────────────────────

export interface DashboardMetrics {
  activeClients: number
  activeProjects: number
  jobsByStatus: Record<JobStatus, number>
  agentsOnline: number
  recentMessages: Message[]
  recentWorkflowRuns: WorkflowRun[]
  recentDeployments: Deployment[]
}

// ─── Adapter contexts ─────────────────────────────────────────────────────────

export interface JobContext {
  jobId: string
  projectId?: string
  clientId?: string
  payload?: unknown
}
