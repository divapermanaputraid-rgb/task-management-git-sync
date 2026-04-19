"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { getLoginRedirectUrl } from "@/lib/auth/redirects";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { canCreateProject } from "@/lib/Permission";
import { createProjectSchema } from "@/lib/validations/project";

export type CreateProjectState = {
  errorMessage?: string;
};

export async function createProjectAction(
  _previousState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const session = await auth();

  if (!session?.user) {
    redirect(getLoginRedirectUrl("/projects/new"));
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
    logger.warn("project.create_session_invalid", {
      area: "projects",
      action: "create_project",
      result: "rejected",
      actorUserId,
      reason: "user_not_found",
    });

    return {
      errorMessage: "Sesi login tidak valid. Silakan login ulang.",
    };
  }

  if (!canCreateProject(actor.role)) {
    logger.warn("project.create_forbidden", {
      area: "projects",
      action: "create_project",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      reason: "insufficient_role",
    });

    return {
      errorMessage: "Anda tidak punya akses untuk membuat project.",
    };
  }

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return {
      errorMessage:
        parsed.error.issues[0]?.message ?? "Data project tidak valid.",
    };
  }

  let createdProjectId: string | null = null;

  try {
    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        startDate: parsed.data.startDate
          ? new Date(parsed.data.startDate)
          : null,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        createdById: actor.id,
      },
      select: {
        id: true,
      },
    });

    logger.info("project.created", {
      area: "projects",
      action: "create_project",
      result: "succeeded",
      actorUserId: actor.id,
      role: actor.role,
      projectId: project.id,
    });

    createdProjectId = project.id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      logger.warn("project.create_session_invalid", {
        area: "projects",
        action: "create_project",
        result: "rejected",
        actorUserId: actor.id,
        role: actor.role,
        reason: "foreign_key_constraint",
      });

      return {
        errorMessage: "Sesi login tidak valid. Silakan login ulang.",
      };
    }

    logger.error("project.create_failed", {
      area: "projects",
      action: "create_project",
      result: "failed",
      actorUserId: actor.id,
      role: actor.role,
      message: error instanceof Error ? error.message : "unknown_error",
    });

    return {
      errorMessage: "Project gagal dibuat. Silakan coba lagi.",
    };
  }

  if (!createdProjectId) {
    return {
      errorMessage: "Project gagal dibuat. Silakan coba lagi.",
    };
  }

  redirect(`/projects/${createdProjectId}`);
}
