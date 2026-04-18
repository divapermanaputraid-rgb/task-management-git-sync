import { prisma } from "@/lib/db/prisma";

type ProjectViewerRole = "PM_ADMIN" | "DEVELOPER";

export type ProjectBrowseStatus = "ACTIVE" | "ARCHIVED" | "ALL";
export type ProjectBrowseScope = "ALL" | "OWNED";

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

export type VisibleProjectDetail = VisibleProjectSummary;

type GetVisibleProjectsParams = {
  userId: string;
  role: ProjectViewerRole;
  filters?: {
    status?: ProjectBrowseStatus;
    scope?: ProjectBrowseScope;
    query?: string;
  };
};

type GetVisibleProjectDetailParams = {
  projectId: string;
  userId: string;
  role: ProjectViewerRole;
};

type ProjectQueryResult = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
  startDate: Date | null;
  endDate: Date | null;
  updatedAt: Date;
  createdBy: {
    name: string | null;
    email: string;
  };
  _count: {
    members: number;
    repositoryConnections: number;
  };
  tasks: Array<{
    status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  }>;
};

function mapVisibleProject(project: ProjectQueryResult): VisibleProjectSummary {
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
}

export async function getVisibleProjects({
  userId,
  role,
  filters,
}: GetVisibleProjectsParams): Promise<VisibleProjectSummary[]> {
  const statusFilter = filters?.status ?? "ACTIVE";
  const scopeFilter = filters?.scope ?? "ALL";
  const queryFilter = filters?.query?.trim() ?? "";

  const projects = await prisma.project.findMany({
    where: {
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      ...(role === "DEVELOPER"
        ? {
            members: {
              some: {
                userId,
              },
            },
          }
        : {}),
      ...(role === "PM_ADMIN" && scopeFilter === "OWNED"
        ? {
            createdById: userId,
          }
        : {}),
      ...(queryFilter
        ? {
            OR: [
              {
                name: {
                  contains: queryFilter,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: queryFilter,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    },
    orderBy:
      statusFilter === "ALL"
        ? [
            {
              status: "asc" as const,
            },
            {
              updatedAt: "desc" as const,
            },
            {
              name: "asc" as const,
            },
          ]
        : [
            {
              updatedAt: "desc" as const,
            },
            {
              name: "asc" as const,
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

  return projects.map(mapVisibleProject);
}

export async function getVisibleProjectDetail({
  projectId,
  userId,
  role,
}: GetVisibleProjectDetailParams): Promise<VisibleProjectDetail | null> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...(role === "DEVELOPER"
        ? {
            members: {
              some: {
                userId,
              },
            },
          }
        : {}),
    },
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

  if (!project) {
    return null;
  }

  return mapVisibleProject(project);
}
