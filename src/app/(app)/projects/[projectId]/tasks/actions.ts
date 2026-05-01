"use server";

import type { ZodError } from "zod";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getLoginRedirectUrl } from "@/lib/auth/redirects";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { validateTaskStatusTransition } from "@/lib/tasks/status";
import { setTaskStatusSchema } from "@/lib/validations/task";

export type SetTaskStatusState = {
  errorMessage?: string;
};

function getTaskStatusPath(projectId: string) {
  return projectId ? `/projects/${encodeURIComponent(projectId)}` : "/projects";
}

function getTaskStatusIssueFields(error: ZodError): string[] | undefined {
  const issueFields = [
    ...new Set(
      error.issues.flatMap((issue) => {
        const field = issue.path[0];

        return typeof field === "string" ? [field] : [];
      }),
    ),
  ];

  return issueFields.length > 0 ? issueFields : undefined;
}

export async function setTaskStatusAction(
  _previousState: SetTaskStatusState,
  formData: FormData,
): Promise<SetTaskStatusState> {
  const rawProjectId = formData.get("projectId");
  const rawTaskId = formData.get("taskId");
  const rawNextStatus = formData.get("nextStatus");
  const projectId = typeof rawProjectId === "string" ? rawProjectId.trim() : "";
  const session = await auth();

  if (!session?.user) {
    redirect(getLoginRedirectUrl(getTaskStatusPath(projectId)));
  }

  const actorUserId = session.user.id;
  const actor = await prisma.user.findUnique({
    where: {
      id: actorUserId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!actor) {
    logger.warn("task.status_session_invalid", {
      area: "tasks",
      action: "set_task_status",
      result: "rejected",
      actorUserId,
      projectId: projectId || undefined,
      reason: "user_not_found",
    });

    return {
      errorMessage: "Sesi login tidak valid. Silakan login ulang.",
    };
  }

  const parsed = setTaskStatusSchema.safeParse({
    projectId: rawProjectId,
    taskId: rawTaskId,
    nextStatus: rawNextStatus,
  });

  if (!parsed.success) {
    logger.warn("task.status_invalid_payload", {
      area: "tasks",
      action: "set_task_status",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: projectId || undefined,
      reason: "invalid_payload",
      issueCount: parsed.error.issues.length,
      issueFields: getTaskStatusIssueFields(parsed.error),
    });

    return {
      errorMessage: "Permintaan perubahan status task tidak valid.",
    };
  }

  const input = parsed.data;
  const task = await prisma.task.findFirst({
    where: {
      id: input.taskId,
      projectId: input.projectId,
      ...(actor.role === "DEVELOPER"
        ? {
            project: {
              members: {
                some: {
                  userId: actor.id,
                },
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      code: true,
      projectId: true,
      status: true,
      archivedAt: true,
      primaryOwnerId: true,
      project: {
        select: {
          status: true,
        },
      },
      assignees: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!task) {
    logger.warn("task.status_missing", {
      area: "tasks",
      action: "set_task_status",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: input.projectId,
      taskId: input.taskId,
      nextStatus: input.nextStatus,
      reason: "task_not_found_or_not_visible",
    });

    return {
      errorMessage: "Task tidak ditemukan.",
    };
  }

  const transition = validateTaskStatusTransition({
    actorUserId: actor.id,
    actorRole: actor.role,
    currentStatus: task.status,
    nextStatus: input.nextStatus,
    assigneeIds: task.assignees.map((assignee) => assignee.userId),
    primaryOwnerId: task.primaryOwnerId,
    isTaskArchived: task.archivedAt !== null,
    projectStatus: task.project.status,
  });

  if (!transition.ok) {
    logger.warn("task.status_invalid_state", {
      area: "tasks",
      action: "set_task_status",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: input.projectId,
      taskId: task.id,
      taskCode: task.code,
      currentStatus: transition.currentStatus,
      nextStatus: transition.nextStatus,
      reason: transition.reason,
    });

    return {
      errorMessage: transition.message,
    };
  }

  try {
    const updateResult = await prisma.$transaction(async (tx) => {
      const result = await tx.task.updateMany({
        where: {
          id: task.id,
          projectId: input.projectId,
          status: transition.currentStatus,
          archivedAt: null,
          project: {
            status: "ACTIVE",
          },
          ...(transition.nextStatus !== "BACKLOG"
            ? {
                primaryOwnerId: {
                  not: null,
                },
              }
            : {}),
          ...(actor.role === "DEVELOPER"
            ? {
                assignees: {
                  some: {
                    userId: actor.id,
                  },
                },
              }
            : transition.nextStatus !== "BACKLOG"
              ? {
                  assignees: {
                    some: {},
                  },
                }
              : {}),
        },
        data: {
          status: transition.nextStatus,
        },
      });

      if (result.count !== 1) {
        return null;
      }

      await tx.taskActivityLog.create({
        data: {
          taskId: task.id,
          actorId: actor.id,
          actionType: "STATUS_CHANGED",
          metadata: {
            code: task.code,
            fromStatus: transition.currentStatus,
            toStatus: transition.nextStatus,
          },
        },
      });

      return {
        taskId: task.id,
        taskCode: task.code,
      };
    });

    if (!updateResult) {
      logger.warn("task.status_conflict", {
        area: "tasks",
        action: "set_task_status",
        result: "rejected",
        actorUserId: actor.id,
        role: actor.role,
        projectId: input.projectId,
        taskId: task.id,
        taskCode: task.code,
        currentStatus: transition.currentStatus,
        nextStatus: transition.nextStatus,
        reason: "stale_transition_state",
      });

      return {
        errorMessage:
          "Status task sudah berubah. Muat ulang halaman lalu coba lagi.",
      };
    }

    logger.info(transition.successEvent, {
      area: "tasks",
      action: "set_task_status",
      result: "succeeded",
      actorUserId: actor.id,
      role: actor.role,
      projectId: input.projectId,
      taskId: updateResult.taskId,
      taskCode: updateResult.taskCode,
      currentStatus: transition.currentStatus,
      nextStatus: transition.nextStatus,
      reason: transition.successReason,
    });
  } catch (error) {
    logger.error(
      "task.status_failed",
      {
        area: "tasks",
        action: "set_task_status",
        result: "failed",
        actorUserId: actor.id,
        role: actor.role,
        projectId: input.projectId,
        taskId: task.id,
        taskCode: task.code,
        currentStatus: transition.currentStatus,
        nextStatus: transition.nextStatus,
        reason: "database_write_failed",
      },
      error,
    );

    return {
      errorMessage: "Status task gagal diperbarui. Silakan coba lagi.",
    };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${input.projectId}`);
  redirect(`/projects/${input.projectId}`);
}
