"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getLoginRedirectUrl } from "@/lib/auth/redirects";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { canArchiveProject } from "@/lib/Permission";
import { toggleProjectArchiveSchema } from "@/lib/validations/project";

export async function setProjectArchiveStateAction(
  formData: FormData,
): Promise<void> {
  const rawProjectId = formData.get("projectId");
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
      projectId: projectId || null,
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
      projectId: projectId || null,
      reason: "insufficient_role",
    });

    redirect("/projects");
  }

  const parsed = toggleProjectArchiveSchema.safeParse({
    projectId: rawProjectId,
    nextStatus: formData.get("nextStatus"),
  });

  if (!parsed.success) {
    logger.warn("project.archive_invalid_payload", {
      area: "projects",
      action: "set_project_archive_state",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: projectId || null,
      reason: "invalid_payload",
    });

    redirect("/projects");
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
    logger.error("project.archive_lookup_failed", {
      area: "projects",
      action: "set_project_archive_state",
      result: "failed",
      actorUserId: actor.id,
      role: actor.role,
      projectId: parsedProjectId,
      message: error instanceof Error ? error.message : "unknown_error",
    });

    redirect(`/projects/${parsedProjectId}`);
  }

  if (!currentProject) {
    logger.warn("project.archive_missing", {
      area: "projects",
      action: "set_project_archive_state",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      projectId: parsedProjectId,
      reason: "project_not_found",
    });

    redirect("/projects");
  }

  try {
    if (currentProject.status !== nextStatus) {
      await prisma.project.update({
        where: {
          id: parsedProjectId,
        },
        data: {
          status: nextStatus,
        },
      });

      logger.info(
        nextStatus === "ARCHIVED" ? "project.archived" : "project.unarchived",
        {
          area: "projects",
          action: "set_project_archive_state",
          result: "succeeded",
          actorUserId: actor.id,
          role: actor.role,
          projectId: parsedProjectId,
          nextStatus,
        },
      );
    }
  } catch (error) {
    logger.error("project.archive_failed", {
      area: "projects",
      action: "set_project_archive_state",
      result: "failed",
      actorUserId: actor.id,
      role: actor.role,
      projectId: parsedProjectId,
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${parsedProjectId}`);
  redirect(`/projects/${parsedProjectId}`);
}
