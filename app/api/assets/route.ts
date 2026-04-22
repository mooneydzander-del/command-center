import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { uploadAsset } from '@/lib/supabase'
import { randomUUID } from 'crypto'

// GET /api/assets?projectId=...&clientId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const clientId = searchParams.get('clientId')
    const messageId = searchParams.get('messageId')

    const assets = await prisma.projectAsset.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(clientId && { clientId }),
        ...(messageId && { messageId }),
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: assets })
  } catch (error) {
    console.error('[GET /api/assets]', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

// POST /api/assets — multipart form upload
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string | null
    const clientId = formData.get('clientId') as string | null
    const messageId = formData.get('messageId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop() ?? 'bin'
    const uuid = randomUUID()
    const storagePath = `${projectId ?? clientId ?? 'general'}/${uuid}.${ext}`

    // Classify asset type
    const mimeType = file.type
    const type =
      mimeType.startsWith('image/') ? 'image' :
      mimeType.startsWith('video/') ? 'video' :
      mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text') ? 'document' :
      'other'

    const { url, error: uploadError } = await uploadAsset(buffer, storagePath, mimeType)
    if (uploadError || !url) {
      return NextResponse.json({ error: uploadError ?? 'Upload failed' }, { status: 500 })
    }

    const asset = await prisma.projectAsset.create({
      data: {
        name: file.name,
        url,
        type,
        mimeType,
        size: file.size,
        projectId: projectId ?? null,
        clientId: clientId ?? null,
        messageId: messageId ?? null,
      },
    })

    return NextResponse.json({ data: asset }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/assets]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
