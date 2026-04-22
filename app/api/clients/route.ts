import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const status = searchParams.get('status')

    const clients = await prisma.client.findMany({
      where: {
        ...(query && {
          OR: [
            { name: { contains: query } },
            { niche: { contains: query } },
            { email: { contains: query } },
          ],
        }),
        ...(status && { status }),
      },
      include: {
        _count: { select: { projects: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json({ data: clients })
  } catch (error) {
    console.error('[GET /api/clients]', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, niche, email, phone, website, notes, status } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: { name, niche, email, phone, website, notes, status: status ?? 'active' },
    })
    return NextResponse.json({ data: client }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/clients]', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
