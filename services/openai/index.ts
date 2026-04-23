import OpenAI from 'openai'
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
  response: string
}

export interface OrchestratorStatus {
  status: 'online' | 'offline' | 'error'
  model: string
  lastUsed: Date | null
}

// ─── Adapter interface ────────────────────────────────────────────────────────

export interface OpenAIOrchestrator {
  classifyCommand(
    command: string,
    context: {
      clientId?: string
      projectId?: string
      clientName?: string
      projectName?: string
      history?: { role: string; content: string }[]
    }
  ): Promise<ClassifiedCommand>

  handleJobUpdate(jobId: string, status: string, result?: unknown): Promise<void>
  getStatus(): Promise<OrchestratorStatus>
  ping(): Promise<boolean>
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the orchestrator for a cinematic website agency called Cinema.

Your job is to read commands from the agency owner and decide what coding jobs to create for Claude Code Worker.

Available job types:
- build_site: Build a new website or page from scratch
- deploy: Deploy a preview or production build to Vercel
- revision: Edit or revise an existing site or section
- review: Review and QA a built page or deployment
- upload_assets: Process, organize, or handle uploaded files/images/videos
- client_update: Update client info, notes, or status
- general: No coding work needed — just information or coordination

Rules:
- You never write code yourself. Only create jobs for Claude Code Worker.
- Always respond with valid JSON matching the ClassifiedCommand schema.
- Keep job titles concise and business-clear (e.g. "Build landing page — Apex Law").
- Set priority: 10 for urgent builds/deploys, 8 for revisions, 5 for reviews, 0 for general.
- Only create jobs if real coding work is needed.

Output format (JSON only, no markdown):
{
  "intent": "<job type>",
  "clientId": "<string or null>",
  "projectId": "<string or null>",
  "jobsToCreate": [
    {
      "title": "<concise job title>",
      "type": "<job type>",
      "description": "<what claude worker should do>",
      "priority": <0-10>
    }
  ],
  "response": "<friendly reply to show in the command center chat>"
}`

// ─── Real implementation ──────────────────────────────────────────────────────

function createOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

async function realClassify(
  client: OpenAI,
  command: string,
  context: { clientId?: string; clientName?: string; projectId?: string; projectName?: string; history?: { role: string; content: string }[] }
): Promise<ClassifiedCommand> {
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

  const userContent = [
    context.clientName ? `Client: ${context.clientName}` : null,
    context.projectName ? `Project: ${context.projectName}` : null,
    `Command: ${command}`,
  ].filter(Boolean).join('\n')

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    // Include last few messages as context if available
    ...((context.history ?? []).slice(-4).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))),
    { role: 'user', content: userContent },
  ]

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.2,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0].message.content ?? '{}'
  const parsed = JSON.parse(raw) as ClassifiedCommand

  // Inject context IDs the model doesn't know
  if (context.clientId && !parsed.clientId) parsed.clientId = context.clientId
  if (context.projectId && !parsed.projectId) parsed.projectId = context.projectId

  return parsed
}

// ─── Exported adapter ────────────────────────────────────────────────────────

export const openAIOrchestrator: OpenAIOrchestrator = {
  async classifyCommand(command, context) {
    const client = createOpenAIClient()
    if (!client) {
      console.warn('[OpenAI] OPENAI_API_KEY not set — using mock classifier')
      return mockClassify(command, context)
    }
    try {
      return await realClassify(client, command, context)
    } catch (err) {
      console.error('[OpenAI] classify failed, falling back to mock', err)
      return mockClassify(command, context)
    }
  },

  async handleJobUpdate(jobId, status, result) {
    // Future: notify orchestrator of job completion for chaining
    console.log('[OpenAI] handleJobUpdate', { jobId, status, result })
  },

  async getStatus() {
    const client = createOpenAIClient()
    if (!client) return { status: 'offline' as const, model: 'not configured', lastUsed: null }
    try {
      // Light ping — list models with timeout
      await client.models.list()
      return {
        status: 'online' as const,
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        lastUsed: new Date(),
      }
    } catch {
      return { status: 'error' as const, model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini', lastUsed: null }
    }
  },

  async ping() {
    const status = await openAIOrchestrator.getStatus()
    return status.status === 'online'
  },
}

// ─── Mock fallback (used when API key missing or request fails) ───────────────

function mockClassify(
  command: string,
  context: { clientId?: string; projectId?: string; clientName?: string }
): ClassifiedCommand {
  const lower = command.toLowerCase()
  let intent: CommandIntent = 'general'
  if (lower.includes('build') || lower.includes('create') || lower.includes('make')) intent = 'build_site'
  else if (lower.includes('deploy')) intent = 'deploy'
  else if (lower.includes('revision') || lower.includes('update') || lower.includes('change')) intent = 'revision'
  else if (lower.includes('review') || lower.includes('check')) intent = 'review'
  else if (lower.includes('upload') || lower.includes('asset')) intent = 'upload_assets'

  const jobsToCreate = intent === 'general' ? [] : [{
    title: `${intent.replace(/_/g, ' ')} — ${context.clientName ?? 'unlinked'}`,
    type: intent,
    description: command,
    priority: intent === 'deploy' ? 8 : intent === 'build_site' ? 10 : 5,
  }]

  return {
    intent,
    clientId: context.clientId ?? null,
    projectId: context.projectId ?? null,
    jobsToCreate,
    response: `Command received. Classified as **${intent}**${jobsToCreate.length ? ` — ${jobsToCreate.length} job(s) queued.` : '. No jobs created.'}`,
  }
}

// Keep named export for easy replacement
export { mockClassify }
