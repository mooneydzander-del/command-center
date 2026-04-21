# Agency Command Center Rules

## Product purpose
This app is an internal command center for a cinematic website business.

## Tool roles
- ChatGPT / OpenAI API is the orchestrator brain.
- Claude Code is the only coding worker.
- n8n is the workflow engine.
- Vercel hosts the app and deployments.
- Antigravity is optional and should be treated as a future synced workspace, not a required dependency.

## Architecture rules
- Use Next.js + TypeScript + Tailwind.
- Keep the database as the source of truth.
- Use modular services/adapters for external tools.
- Never hardcode secrets.
- No direct production deployment without approval state.
- Keep code simple, scalable, and clean.
- Avoid overengineering.

## UI rules
- Premium dark interface.
- Clear status indicators.
- Dashboard-first layout.
- Fast command-center usability.
- Search must be prominent.

## Development workflow
- Plan before coding.
- Use typed schemas.
- Keep files focused.
- Verify behavior after major changes.
- Prefer stable, expandable patterns over clever ones.
