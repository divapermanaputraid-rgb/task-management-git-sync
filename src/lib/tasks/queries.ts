import { prisma } from "@/lib/db/prisma";

export const TASK_BOARD_STATUSES = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
] as const;

export type TaskBoardStatus = (typeof TASK_BOARD_STATUSES)[number];

export type VisibleTaskCard = {
  id: string;
  code: string;
  title: string;
  status: TaskBoardStatus;
  startDate: Date | null;
  endDate: Date | null;
  primaryOwnerLabel: string | null;
  assigneeCount: number;
};

export type VisibleTaskBoardColumn = {
  status: TaskBoardStatus;
  tasks: VisibleTaskCard[];
};

type GetVisibleProjectTaskBoardParams = {
  projectId: string;
  userId: string;
  role: "PM_ADMIN" | "DEVELOPER";
};

const emptyColumns = TASK_BOARD_STATUSES.map((status) => ({
  status,
  tasks: [],
}));

export async function getVisibleProjectTaskBoard({
  projectId,
  userId,
  role,
}: GetVisibleProjectTaskBoardParams): Promise<VisibleTaskBoardColumn[]> {
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
      tasks: {
        where: {
          archivedAt: null,
        },
        orderBy: [
          {
            sequenceNumber: "asc",
          },
        ],
        select: {
          id: true,
          code: true,
          title: true,
          status: true,
          startDate: true,
          endDate: true,
          primaryOwner: {
            select: {
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              assignees: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    return emptyColumns;
  }

  return TASK_BOARD_STATUSES.map((status) => ({
    status,
    tasks: project.tasks
      .filter((task) => task.status === status)
      .map((task) => ({
        id: task.id,
        code: task.code,
        title: task.title,
        status: task.status,
        startDate: task.startDate,
        endDate: task.endDate,
        primaryOwnerLabel: task.primaryOwner
          ? (task.primaryOwner.name ?? task.primaryOwner.email)
          : null,
        assigneeCount: task._count.assignees,
      })),
  }));
}
