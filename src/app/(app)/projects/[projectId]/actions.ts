"use server";

import type { ZodError } from "zod";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getLoginRedirectUrl } from "@/lib/auth/redirects";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { canArchiveProject } from "@/lib/Permission";
import { validateProjectArchiveTransition } from "@/lib/projects/archive";
import { toggleProjectArchiveSchema } from "@/lib/validations/project";

export type ProjectArchiveActionState = {
  errorMessage?: string;
};

function getArchiveIssueFields(error: ZodError): string[] | undefined {
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

export async function setProjectArchiveStateAction(
  _previousState: ProjectArchiveActionState,
  formData: FormData,
): Promise<ProjectArchiveActionState> {
  const rawProjectId = formData.get("projectId");
  const rawNextStatus = formData.get("nextStatus");
  const projectId = typeof rawProjectId === "string" ? rawProjectId : "";
  const session = await auth();

  if (!session?.user) {
    redirect(
      getLoginRedirectUrl(projectId ? `/projects/${projectId}` : "/projects"),
    );
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
    logger.warn("project.archive_session_invalid", {
      area: "projects",
      action: "set_project_archive_state",
      result: "rejected",
      actorUserId,
      projectId: projectId || undefined,
      reason: "user_not_found",
    });

    redirect(
      getLoginRedirectUrl(projectId ? `/projects/${projectId}` : "/projects"),
    );
  }

  if (!canArchiveProject(actor.role)) {
    logger.warn("project.archive_forbidden", {
      area: "projects",
      action: "set_project_archive_state",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: projectId || undefined,
      reason: "insufficient_role",
    });

    return {
      errorMessage: "Anda tidak punya akses untuk mengubah status project.",
    };
  }

  const parsed = toggleProjectArchiveSchema.safeParse({
    projectId: rawProjectId,
    nextStatus: rawNextStatus,
  });

  if (!parsed.success) {
    logger.warn("project.archive_invalid_payload", {
      area: "projects",
      action: "set_project_archive_state",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: projectId || undefined,
      reason: "invalid_payload",
      issueCount: parsed.error.issues.length,
      issueFields: getArchiveIssueFields(parsed.error),
    });

    return {
      errorMessage: "Permintaan perubahan status project tidak valid.",
    };
  }

  const { projectId: parsedProjectId, nextStatus } = parsed.data;
  let currentProject: { id: string; status: "ACTIVE" | "ARCHIVED" } | null =
    null;

  try {
    currentProject = await prisma.project.findUnique({
      where: {
        id: parsedProjectId,
      },
      select: {
        id: true,
        status: true,
      },
    });
  } catch (error) {
    logger.error(
      "project.archive_lookup_failed",
      {
        area: "projects",
        action: "set_project_archive_state",
        result: "failed",
        actorUserId: actor.id,
        role: actor.role,
        projectId: parsedProjectId,
        nextStatus,
        reason: "database_lookup_failed",
      },
      error,
    );

    return {
      errorMessage: "Status project gagal diperiksa. Silakan coba lagi.",
    };
  }

  if (!currentProject) {
    logger.warn("project.archive_missing", {
      area: "projects",
      action: "set_project_archive_state",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: parsedProjectId,
      nextStatus,
      reason: "project_not_found",
    });

    return {
      errorMessage: "Project tidak ditemukan.",
    };
  }

  const transition = validateProjectArchiveTransition({
    currentStatus: currentProject.status,
    nextStatus,
  });

  if (!transition.ok) {
    logger.warn("project.archive_invalid_state", {
      area: "projects",
      action: "set_project_archive_state",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: parsedProjectId,
      currentStatus: transition.currentStatus,
      nextStatus: transition.nextStatus,
      reason: transition.reason,
    });

    return {
      errorMessage: transition.message,
    };
  }

  try {
    const updateResult = await prisma.project.updateMany({
      where: {
        id: parsedProjectId,
        status: transition.currentStatus,
      },
      data: {
        status: transition.nextStatus,
      },
    });

    if (updateResult.count !== 1) {
      logger.warn("project.archive_conflict", {
        area: "projects",
        action: "set_project_archive_state",
        result: "rejected",
        actorUserId: actor.id,
        role: actor.role,
        projectId: parsedProjectId,
        currentStatus: transition.currentStatus,
        nextStatus: transition.nextStatus,
        reason: "stale_transition_state",
      });

      return {
        errorMessage:
          "Status project sudah berubah. Muat ulang halaman lalu coba lagi.",
      };
    }

    logger.info(transition.successEvent, {
      area: "projects",
      action: "set_project_archive_state",
      result: "succeeded",
      actorUserId: actor.id,
      role: actor.role,
      projectId: parsedProjectId,
      currentStatus: transition.currentStatus,
      nextStatus: transition.nextStatus,
      reason: transition.successReason,
    });
  } catch (error) {
    logger.error(
      "project.archive_failed",
      {
        area: "projects",
        action: "set_project_archive_state",
        result: "failed",
        actorUserId: actor.id,
        role: actor.role,
        projectId: parsedProjectId,
        currentStatus: transition.currentStatus,
        nextStatus: transition.nextStatus,
        reason: "database_write_failed",
      },
      error,
    );

    return {
      errorMessage: "Status project gagal diperbarui. Silakan coba lagi.",
    };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${parsedProjectId}`);
  redirect(`/projects/${parsedProjectId}`);
}
