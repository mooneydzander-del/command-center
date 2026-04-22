import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { vercelAdapter } from '@/services/vercel'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { approvalState, status, approvedBy } = body

    const current = await prisma.deployment.findUnique({ where: { id }, include: { project: true } })
    if (!current) return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })

    // If approving a production deployment, trigger Vercel deploy
    if (approvalState === 'approved' && current.approvalState === 'pending') {
      try {
        const vercelDeploy = await vercelAdapter.deploy(current.project.name, 'production')
        await prisma.deployment.update({
          where: { id },
          data: {
            approvalState: 'approved',
            approvedBy: approvedBy ?? 'user',
            status: 'building',
            vercelId: vercelDeploy.id,
            url: vercelDeploy.url,
          },
        })
        return NextResponse.json({ data: { approved: true, vercelId: vercelDeploy.id } })
      } catch (deployErr) {
        console.error('[Vercel deploy failed]', deployErr)
        await prisma.deployment.update({
          where: { id },
          data: { approvalState: 'approved', approvedBy: approvedBy ?? 'user', status: 'error' },
        })
        return NextResponse.json({ error: 'Deployment approved but Vercel deploy failed' }, { status: 502 })
      }
    }

    // Generic update (reject, status change)
    const deployment = await prisma.deployment.update({
      where: { id },
      data: {
        ...(approvalState && { approvalState }),
        ...(status && { status }),
        ...(approvedBy && { approvedBy }),
        ...(status === 'ready' ? { readyAt: new Date() } : {}),
      },
    })
    return NextResponse.json({ data: deployment })
  } catch (error) {
    console.error('[PATCH /api/deployments/[id]]', error)
    return NextResponse.json({ error: 'Failed to update deployment' }, { status: 500 })
  }
}
