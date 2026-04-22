import type { JobContext } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommandIntent =
  | 'build_site'
  | 'deploy'
  | 'revision'
  | 'review'
  | 'upload_assets'
  | 'client_update'
  | 'general'

export interface ClassifiedCommand {
  intent: CommandIntent
  clientId: string | null
  projectId: string | null
  jobsToCreate: {
    title: string
    type: string
    description: string
    priority: number
  }[]
  response: string // human-readable reply to show in chat
}

export interface OrchestratorStatus {
  status: 'online' | 'offline' | 'error'
  model: string
  lastUsed: Date | null
}

// ─── Adapter interface ────────────────────────────────────────────────────────

export interface OpenAIOrchestrator {
  /**
   * Classify a user command and return structured jobs to create.
   * This is the main entry point — the orchestrator never writes code itself.
   */
  classifyCommand(
    command: string,
    context: { clientId?: string; projectId?: string; history?: { role: string; content: string }[] }
  ): Promise<ClassifiedCommand>

  /**
   * Update job routing — called when a job finishes or errors.
   */
  handleJobUpdate(jobId: string, status: string, result?: unknown): Promise<void>

  getStatus(): Promise<OrchestratorStatus>
  ping(): Promise<boolean>
}

// ─── Mock implementation ──────────────────────────────────────────────────────

export const mockOpenAIOrchestrator: OpenAIOrchestrator = {
  async classifyCommand(command, context) {
    console.log('[OpenAI Mock] classifyCommand', { command, context })

    // Naive classification for mock purposes
    const lower = command.toLowerCase()
    let intent: CommandIntent = 'general'
    if (lower.includes('build') || lower.includes('create') || lower.includes('make')) intent = 'build_site'
    else if (lower.includes('deploy')) intent = 'deploy'
    else if (lower.includes('revision') || lower.includes('update') || lower.includes('change')) intent = 'revision'
    else if (lower.includes('review') || lower.includes('check')) intent = 'review'
    else if (lower.includes('upload') || lower.includes('asset')) intent = 'upload_assets'

    const jobsToCreate = intent === 'general' ? [] : [
      {
        title: `${intent.replace(/_/g, ' ')} — ${context.clientId ? 'linked client' : 'unlinked'}`,
        type: intent,
        description: command,
        priority: intent === 'deploy' ? 8 : intent === 'build_site' ? 10 : 5,
      },
    ]

    return {
      intent,
      clientId: context.clientId ?? null,
      projectId: context.projectId ?? null,
      jobsToCreate,
      response: `Understood. I've classified this as a **${intent.replace(/_/g, ' ')}** command${
        jobsToCreate.length ? ` and created ${jobsToCreate.length} job(s)` : ''
      }. ${jobsToCreate.length ? 'Claude Code will pick these up and get to work.' : 'No coding jobs needed for this command.'}`,
    }
  },

  async handleJobUpdate(jobId, status, result) {
    console.log('[OpenAI Mock] handleJobUpdate', { jobId, status, result })
  },

  async getStatus() {
    return {
      status: 'online' as const,
      model: 'gpt-4o (mock)',
      lastUsed: new Date(),
    }
  },

  async ping() {
    return true
  },
}

// Replace with real OpenAI implementation in Phase 3
// Real adapter will use: openai.chat.completions.create() with tool_choice for structured output
export const openAIOrchestrator: OpenAIOrchestrator = mockOpenAIOrchestrator
