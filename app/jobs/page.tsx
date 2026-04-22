import { prisma } from '@/lib/db'
import { JobsView } from '@/components/jobs/JobsView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    include: {
      project: { select: { name: true, client: { select: { name: true } } } },
      agent: { select: { name: true } },
    },
    orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
  })

  return <JobsView initialJobs={jobs} />
}
