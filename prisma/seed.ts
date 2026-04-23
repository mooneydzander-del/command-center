import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database…')

  // Agents
  await prisma.agent.upsert({
    where: { id: 'agent-openai' },
    update: {},
    create: {
      id: 'agent-openai',
      name: 'OpenAI Orchestrator',
      type: 'openai_orchestrator',
      status: 'online',
      currentTask: null,
      lastHeartbeat: new Date(),
    },
  })

  const claudeWorker = await prisma.agent.upsert({
    where: { id: 'agent-claude-worker' },
    update: {},
    create: {
      id: 'agent-claude-worker',
      name: 'Claude Worker #1',
      type: 'claude_worker',
      status: 'online',
      currentTask: null,
      lastHeartbeat: new Date(),
    },
  })

  console.log('✓ Agents seeded')

  // Clients
  const apexLaw = await prisma.client.upsert({
    where: { id: 'client-apex-law' },
    update: {},
    create: {
      id: 'client-apex-law',
      name: 'Apex Law Group',
      niche: 'Legal',
      status: 'active',
      email: 'hello@apexlaw.com',
      phone: '+1 (212) 555-0190',
      website: 'apexlaw.com',
      notes: 'Premium law firm in Manhattan. Dark navy and gold brand standards. CEO: Robert Crane.',
    },
  })

  const riviera = await prisma.client.upsert({
    where: { id: 'client-riviera' },
    update: {},
    create: {
      id: 'client-riviera',
      name: 'Riviera Wellness',
      niche: 'Health & Wellness',
      status: 'active',
      email: 'contact@riviera.co',
      website: 'riviera.co',
    },
  })

  const cinematicCo = await prisma.client.upsert({
    where: { id: 'client-cinematic' },
    update: {},
    create: {
      id: 'client-cinematic',
      name: 'Cinematic Co',
      niche: 'Creative Agency',
      status: 'active',
      email: 'hi@cinematic.co',
    },
  })

  const meridian = await prisma.client.upsert({
    where: { id: 'client-meridian' },
    update: {},
    create: {
      id: 'client-meridian',
      name: 'Meridian Capital',
      niche: 'Finance',
      status: 'prospect',
      email: 'contact@meridiancap.com',
    },
  })

  console.log('✓ Clients seeded')

  // Projects
  const apexProject = await prisma.project.upsert({
    where: { id: 'project-apex-v2' },
    update: {},
    create: {
      id: 'project-apex-v2',
      name: 'Apex Law — v2 Site',
      clientId: apexLaw.id,
      status: 'in_progress',
      description: 'Full cinematic redesign. Video background hero, dark legal aesthetic, gold accents.',
      previewUrl: 'apex-law-v2.vercel.app',
    },
  })

  const rivieraProject = await prisma.project.upsert({
    where: { id: 'project-riviera-landing' },
    update: {},
    create: {
      id: 'project-riviera-landing',
      name: 'Riviera — Landing Page',
      clientId: riviera.id,
      status: 'review',
      description: 'Calming wellness landing page with booking flow.',
      previewUrl: 'riviera-wellness.vercel.app',
    },
  })

  const cinematicProject = await prisma.project.upsert({
    where: { id: 'project-cinematic-full' },
    update: {},
    create: {
      id: 'project-cinematic-full',
      name: 'Cinematic Co — Full Build',
      clientId: cinematicCo.id,
      status: 'deployed',
      description: 'Complete agency site with portfolio and contact gate.',
      productionUrl: 'cinematic.co',
    },
  })

  console.log('✓ Projects seeded')

  // Jobs
  await prisma.job.upsert({
    where: { id: 'job-apex-build' },
    update: {},
    create: {
      id: 'job-apex-build',
      title: 'Build landing page — Apex Law',
      type: 'build_site',
      status: 'running',
      projectId: apexProject.id,
      agentId: claudeWorker.id,
      priority: 10,
    },
  })

  await prisma.job.upsert({
    where: { id: 'job-riviera-review' },
    update: {},
    create: {
      id: 'job-riviera-review',
      title: 'Review Riviera preview',
      type: 'review',
      status: 'waiting_for_approval',
      projectId: rivieraProject.id,
      agentId: claudeWorker.id,
      priority: 8,
    },
  })

  await prisma.job.upsert({
    where: { id: 'job-cinematic-deploy' },
    update: {},
    create: {
      id: 'job-cinematic-deploy',
      title: 'Deploy — Cinematic Co',
      type: 'deploy',
      status: 'completed',
      projectId: cinematicProject.id,
      agentId: claudeWorker.id,
      priority: 0,
      completedAt: new Date('2026-04-05'),
    },
  })

  console.log('✓ Jobs seeded')

  // System message
  await prisma.message.upsert({
    where: { id: 'msg-system-init' },
    update: {},
    create: {
      id: 'msg-system-init',
      role: 'system',
      content: 'Cinema Command Center initialized. OpenAI orchestrator ready.',
    },
  })

  console.log('✓ Messages seeded')
  console.log('\nSeed complete.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
