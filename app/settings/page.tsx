import { Settings, Key, Zap, Globe, Database } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const INTEGRATIONS = [
  { name: 'OpenClaw', description: 'Commander & dispatcher agent', key: 'OPENCLAW_API_KEY', status: 'not_configured' },
  { name: 'n8n', description: 'Workflow engine webhook URL', key: 'N8N_WEBHOOK_URL', status: 'not_configured' },
  { name: 'Vercel', description: 'Deployment API token', key: 'VERCEL_TOKEN', status: 'not_configured' },
  { name: 'Antigravity', description: 'Optional synced workspace', key: 'ANTIGRAVITY_API_KEY', status: 'not_configured' },
]

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="font-display text-xl text-cream">Settings</h2>
        <p className="text-xs text-muted mt-0.5">Configure integrations, environment, and app preferences</p>
      </div>

      {/* App info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs font-medium text-muted uppercase tracking-widest">App</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cream">Agency Command Center</p>
              <p className="text-xs text-muted">Phase 1 — mock data only</p>
            </div>
            <span className="text-xs text-muted bg-obsidian-700 border border-border px-2 py-1 rounded">v0.1.0</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted pt-2 border-t border-border">
            <Database className="w-3.5 h-3.5" />
            <span>Database: SQLite (local dev) — switch to PostgreSQL for production</span>
          </div>
        </CardBody>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Integrations</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-muted">Add secrets to <code className="bg-obsidian-700 px-1.5 py-0.5 rounded text-cream">.env.local</code> to connect real adapters. Phase 3 will wire these up.</p>
          <div className="space-y-3">
            {INTEGRATIONS.map(integration => (
              <div key={integration.name} className="flex items-center gap-3 bg-obsidian-900 border border-border rounded-md px-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cream">{integration.name}</p>
                  <p className="text-xs text-muted">{integration.description}</p>
                  <code className="text-xs text-muted/60">{integration.key}</code>
                </div>
                <span className="text-xs text-muted bg-obsidian-700 px-2 py-1 rounded border border-border">
                  {integration.status === 'configured' ? '✓ Connected' : 'Not configured'}
                </span>
              </div>
            ))}
          </div>
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
            All secrets live in <code className="bg-obsidian-700 px-1.5 py-0.5 rounded text-cream">.env.local</code> (gitignored).
            For Vercel deployment, add them via the Vercel dashboard environment variables panel.
          </p>
          <div className="bg-obsidian-900 border border-border rounded-md p-3 font-mono text-xs text-muted space-y-1">
            <p>DATABASE_URL=<span className="text-cream">file:./dev.db</span></p>
            <p>NEXT_PUBLIC_APP_URL=<span className="text-cream">http://localhost:3000</span></p>
            <p className="text-muted/40"># OPENCLAW_API_KEY=</p>
            <p className="text-muted/40"># N8N_WEBHOOK_URL=</p>
            <p className="text-muted/40"># VERCEL_TOKEN=</p>
          </div>
        </CardBody>
      </Card>

      {/* Deployment */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-muted" />
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Vercel Deployment</span>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-xs text-muted">This app is configured to deploy on Vercel. Push to main to auto-deploy.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">View on Vercel</Button>
            <Button variant="ghost" size="sm">Copy Deploy URL</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
