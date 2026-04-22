import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const projects = await prisma.project.findMany({
      where: {
        ...(status && { status }),
        ...(clientId && { clientId }),
        ...(query && {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        }),
      },
      include: {
        client: { select: { name: true } },
        _count: { select: { jobs: true, assets: true, deployments: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ data: projects })
  } catch (error) {
    console.error('[GET /api/projects]', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, clientId, status, description, previewUrl, productionUrl } = body

    if (!name || !clientId) {
      return NextResponse.json({ error: 'name and clientId are required' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: { name, clientId, status: status ?? 'planning', description, previewUrl, productionUrl },
      include: { client: { select: { name: true } } },
    })
    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/projects]', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
