import { Key, Zap, Globe, Database, Bot } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

const INTEGRATIONS = [
  {
    name: 'OpenAI',
    description: 'Orchestrator — classifies commands, creates jobs, routes work to Claude Code',
    keys: ['OPENAI_API_KEY', 'OPENAI_MODEL'],
    configured: !!process.env.OPENAI_API_KEY,
  },
  {
    name: 'Claude Worker',
    description: 'Coding worker — builds sites, processes jobs, writes and edits code',
    keys: ['CLAUDE_WORKER_API_URL', 'CLAUDE_WORKER_API_KEY'],
    configured: !!process.env.CLAUDE_WORKER_API_URL,
  },
  {
    name: 'n8n',
    description: 'Workflow engine — triggers automations, pipelines, and notifications',
    keys: ['N8N_BASE_URL', 'N8N_API_KEY'],
    configured: !!process.env.N8N_BASE_URL,
  },
  {
    name: 'Vercel',
    description: 'Deployment — triggers and tracks project deployments',
    keys: ['VERCEL_TOKEN', 'VERCEL_TEAM_ID'],
    configured: !!process.env.VERCEL_TOKEN,
  },
  {
    name: 'Supabase',
    description: 'PostgreSQL database and file storage for client assets',
    keys: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
    configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  },
]

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const configuredCount = INTEGRATIONS.filter(i => i.configured).length

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="font-display text-xl text-cream">Settings</h2>
        <p className="text-xs text-muted mt-0.5">
          {configuredCount} of {INTEGRATIONS.length} integrations connected
        </p>
      </div>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Integrations</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-2">
          {INTEGRATIONS.map(integration => (
            <div key={integration.name} className="flex items-center gap-3 bg-obsidian-950 border border-border rounded-md px-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cream">{integration.name}</p>
                <p className="text-xs text-muted">{integration.description}</p>
                <div className="flex flex-wrap gap-3 mt-1">
                  {integration.keys.map(k => (
                    <code key={k} className="text-xs text-muted/50">{k}</code>
                  ))}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded border shrink-0 ${
                integration.configured
                  ? 'text-status-running bg-status-running/10 border-status-running/30'
                  : 'text-muted bg-obsidian-800 border-border'
              }`}>
                {integration.configured ? '✓ Connected' : 'Not configured'}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Environment */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Environment Variables</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-xs text-muted">
            All secrets live in{' '}
            <code className="bg-obsidian-800 px-1.5 py-0.5 rounded text-cream">.env.local</code> (gitignored).
            See{' '}
            <code className="bg-obsidian-800 px-1.5 py-0.5 rounded text-cream">.env.example</code> for the full list.
            For production, add them in the Vercel dashboard.
          </p>
          <div className="bg-obsidian-950 border border-border rounded-md p-3 font-mono text-xs space-y-1">
            <p className="text-muted/60"># Supabase (required)</p>
            <p><span className="text-muted">NEXT_PUBLIC_SUPABASE_URL</span>=<span className="text-cream">https://….supabase.co</span></p>
            <p><span className="text-muted">SUPABASE_SERVICE_ROLE_KEY</span>=<span className="text-cream">eyJ…</span></p>
            <p className="text-muted/60 mt-2"># OpenAI (required)</p>
            <p><span className="text-muted">OPENAI_API_KEY</span>=<span className="text-cream">sk-…</span></p>
            <p><span className="text-muted">OPENAI_MODEL</span>=<span className="text-cream">gpt-4o-mini</span></p>
            <p className="text-muted/60 mt-2"># Claude Worker (optional — jobs queue without it)</p>
            <p><span className="text-muted">CLAUDE_WORKER_API_URL</span>=<span className="text-cream">http://localhost:4002</span></p>
            <p className="text-muted/60 mt-2"># n8n (optional — workflows disabled without it)</p>
            <p><span className="text-muted">N8N_BASE_URL</span>=<span className="text-cream">http://localhost:5678</span></p>
            <p className="text-muted/60 mt-2"># Vercel (optional)</p>
            <p><span className="text-muted">VERCEL_TOKEN</span>=<span className="text-cream">…</span></p>
          </div>
        </CardBody>
      </Card>

      {/* Architecture */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Architecture</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-2 text-xs text-muted leading-relaxed">
          <p><span className="text-cream">OpenAI</span> — orchestrator. Reads commands, creates jobs, routes to workers. Never writes code.</p>
          <p><span className="text-cream">Claude Code</span> — the only coding worker. Builds websites, processes files, reads queued jobs.</p>
          <p><span className="text-cream">n8n</span> — workflow engine. Automations, notifications, multi-step pipelines.</p>
          <p><span className="text-cream">Vercel</span> — hosts this app and client project deployments.</p>
          <p><span className="text-cream">Supabase</span> — PostgreSQL database and file storage.</p>
        </CardBody>
      </Card>

      {/* App info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs font-medium text-muted uppercase tracking-widest">App</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cream">Cinema Command Center</p>
              <p className="text-xs text-muted">Auto-deploys on push to master via Vercel</p>
            </div>
            <span className="text-xs text-muted bg-obsidian-800 border border-border px-2 py-1 rounded">v0.2.0</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted pt-2 border-t border-border">
            <Database className="w-3.5 h-3.5" />
            <span>Supabase PostgreSQL — connected via pooler</span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
