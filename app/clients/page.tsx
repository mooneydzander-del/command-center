import { prisma } from '@/lib/db'
import { ClientsView } from '@/components/clients/ClientsView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return <ClientsView initialClients={clients} />
}
