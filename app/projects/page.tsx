import { prisma } from '@/lib/db'
import { ProjectsView } from '@/components/projects/ProjectsView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { client: { select: { name: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return <ProjectsView initialProjects={projects} />
}
