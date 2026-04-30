"use server";

import type { ZodError } from "zod";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getLoginRedirectUrl } from "@/lib/auth/redirects";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { canCreateTask } from "@/lib/Permission";
import { formatTaskCode } from "@/lib/tasks/codes";
import { createTaskSchema } from "@/lib/validations/task";

const createTaskFieldNames = [
  "projectId",
  "title",
  "description",
  "startDate",
  "endDate",
] as const;

type CreateTaskFieldName = (typeof createTaskFieldNames)[number];

type CreateTaskFieldErrors = Partial<Record<CreateTaskFieldName, string>>;

const createTaskFieldNameSet = new Set<CreateTaskFieldName>(
  createTaskFieldNames,
);

export type CreateTaskState = {
  errorMessage?: string;
  fieldErrors?: CreateTaskFieldErrors;
};

function getCreateTaskFieldErrors(error: ZodError): CreateTaskFieldErrors {
  const fieldErrors: CreateTaskFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field !== "string") {
      continue;
    }

    const fieldName = field as CreateTaskFieldName;

    if (!createTaskFieldNameSet.has(fieldName) || fieldErrors[fieldName]) {
      continue;
    }

    fieldErrors[fieldName] = issue.message;
  }

  return fieldErrors;
}

function getTaskCreatePath(projectId: string) {
  return projectId
    ? `/projects/${encodeURIComponent(projectId)}/tasks/new`
    : "/projects";
}

export async function createTaskAction(
  _previousState: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
  const rawProjectId = formData.get("projectId");
  const projectId = typeof rawProjectId === "string" ? rawProjectId.trim() : "";
  const session = await auth();

  if (!session?.user) {
    redirect(getLoginRedirectUrl(getTaskCreatePath(projectId)));
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
    logger.warn("task.create_session_invalid", {
      area: "tasks",
      action: "create_task",
      result: "rejected",
      actorUserId,
      projectId: projectId || undefined,
      reason: "user_not_found",
    });

    return {
      errorMessage: "Sesi login tidak valid. Silakan login ulang.",
    };
  }

  if (!canCreateTask(actor.role)) {
    logger.warn("task.create_forbidden", {
      area: "tasks",
      action: "create_task",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: projectId || undefined,
      reason: "insufficient_role",
    });

    return {
      errorMessage: "Anda tidak punya akses untuk membuat task.",
    };
  }

  const parsed = createTaskSchema.safeParse({
    projectId: rawProjectId,
    title: formData.get("title"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    const fieldErrors = getCreateTaskFieldErrors(parsed.error);
    const issueFields = Object.keys(fieldErrors) as CreateTaskFieldName[];

    logger.warn("task.create_invalid_payload", {
      area: "tasks",
      action: "create_task",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: projectId || undefined,
      reason: "invalid_payload",
      issueCount: parsed.error.issues.length,
      issueFields: issueFields.length > 0 ? issueFields : undefined,
    });

    return {
      errorMessage: parsed.error.issues[0]?.message ?? "Data task tidak valid.",
      fieldErrors,
    };
  }

  const taskInput = parsed.data;
  const project = await prisma.project.findUnique({
    where: {
      id: taskInput.projectId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!project) {
    logger.warn("task.create_project_missing", {
      area: "tasks",
      action: "create_task",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: taskInput.projectId,
      reason: "project_not_found",
    });

    return {
      errorMessage: "Project tidak ditemukan.",
    };
  }

  if (project.status === "ARCHIVED") {
    logger.warn("task.create_project_archived", {
      area: "tasks",
      action: "create_task",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: project.id,
      reason: "project_archived",
    });

    return {
      errorMessage: "Project arsip tidak bisa menerima task baru.",
    };
  }

  let createdTask: { id: string; code: string } | null = null;

  try {
    createdTask = await prisma.$transaction(async (tx) => {
      const [updatedProject] = await tx.project.updateManyAndReturn({
        where: {
          id: project.id,
          status: "ACTIVE",
        },
        data: {
          taskCodeCounter: {
            increment: 1,
          },
        },
        select: {
          taskCodeCounter: true,
        },
      });

      if (!updatedProject) {
        return null;
      }

      const sequenceNumber = updatedProject.taskCodeCounter;
      const code = formatTaskCode(sequenceNumber);
      const task = await tx.task.create({
        data: {
          projectId: project.id,
          code,
          title: taskInput.title,
          description: taskInput.description,
          status: "BACKLOG",
          startDate: taskInput.startDate,
          endDate: taskInput.endDate,
          sequenceNumber,
          createdById: actor.id,
        },
        select: {
          id: true,
          code: true,
          title: true,
          status: true,
        },
      });

      await tx.taskActivityLog.create({
        data: {
          taskId: task.id,
          actorId: actor.id,
          actionType: "TASK_CREATED",
          metadata: {
            code: task.code,
            title: task.title,
            status: task.status,
          },
        },
      });

      return {
        id: task.id,
        code: task.code,
      };
    });
  } catch (error) {
    logger.error(
      "task.create_failed",
      {
        area: "tasks",
        action: "create_task",
        result: "failed",
        actorUserId: actor.id,
        role: actor.role,
        projectId: project.id,
        reason: "database_write_failed",
      },
      error,
    );

    return {
      errorMessage: "Task gagal dibuat. Silakan coba lagi.",
    };
  }

  if (!createdTask) {
    logger.warn("task.create_conflict", {
      area: "tasks",
      action: "create_task",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: project.id,
      reason: "project_not_active",
    });

    return {
      errorMessage:
        "Project sudah tidak aktif. Muat ulang halaman lalu coba lagi.",
    };
  }

  logger.info("task.created", {
    area: "tasks",
    action: "create_task",
    result: "succeeded",
    actorUserId: actor.id,
    role: actor.role,
    projectId: project.id,
    taskId: createdTask.id,
    taskCode: createdTask.code,
    reason: "task_created",
  });

  redirect(`/projects/${project.id}`);
}
