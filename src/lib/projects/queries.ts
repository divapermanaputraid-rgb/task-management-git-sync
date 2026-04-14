import { prisma } from "@/lib/db/prisma";

type ProjectViewerRole = "PM_ADMIN" | "DEVELOPER";

export type VisibleProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
  startDate: Date | null;
  endDate: Date | null;
  updatedAt: Date;
  createdByLabel: string;
  memberCount: number;
  activeTaskCount: number;
  completedTaskCount: number;
  repositoryCount: number;
  progressPercentage: number;
};

type GetVisibleProjectsParams = {
  userId: string;
  role: ProjectViewerRole;
};

export async function getVisibleProjects({
  userId,
  role,
}: GetVisibleProjectsParams): Promise<VisibleProjectSummary[]> {
  const where =
    role === "PM_ADMIN"
      ? {
          status: "ACTIVE" as const,
        }
      : {
          status: "ACTIVE" as const,
          members: {
            some: {
              userId,
            },
          },
        };

  const projects = await prisma.project.findMany({
    where,
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        name: "asc",
      },
    ],
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      startDate: true,
      endDate: true,
      updatedAt: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          members: true,
          repositoryConnections: true,
        },
      },
      tasks: {
        where: {
          archivedAt: null,
        },
        select: {
          status: true,
        },
      },
    },
  });

  return projects.map((project) => {
    const activeTaskCount = project.tasks.length;
    const completedTaskCount = project.tasks.filter(
      (task) => task.status === "DONE",
    ).length;

    const progressPercentage =
      activeTaskCount === 0
        ? 0
        : Math.round((completedTaskCount / activeTaskCount) * 100);

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      updatedAt: project.updatedAt,
      createdByLabel: project.createdBy.name ?? project.createdBy.email,
      memberCount: project._count.members,
      activeTaskCount,
      completedTaskCount,
      repositoryCount: project._count.repositoryConnections,
      progressPercentage,
    };
  });
}
