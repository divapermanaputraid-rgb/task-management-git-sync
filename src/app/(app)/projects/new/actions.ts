"use server";
import type { ZodError } from "zod";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { getLoginRedirectUrl } from "@/lib/auth/redirects";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { canCreateProject } from "@/lib/Permission";
import { createProjectSchema } from "@/lib/validations/project";

const createProjectFieldNames = [
  "name",
  "description",
  "startDate",
  "endDate",
] as const;

type CreateProjectFieldName = (typeof createProjectFieldNames)[number];

type CreateProjectFieldErrors = Partial<Record<CreateProjectFieldName, string>>;

const createProjectFieldNameSet = new Set<CreateProjectFieldName>(
  createProjectFieldNames,
);

export type CreateProjectState = {
  errorMessage?: string;
  fieldErrors?: CreateProjectFieldErrors;
};

function getCreateProjectFieldErrors(
  error: ZodError,
): CreateProjectFieldErrors {
  const fieldErrors: CreateProjectFieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field !== "string") {
      continue;
    }

    const fieldName = field as CreateProjectFieldName;

    if (!createProjectFieldNameSet.has(fieldName) || fieldErrors[fieldName]) {
      continue;
    }

    fieldErrors[fieldName] = issue.message;
  }

  return fieldErrors;
}

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
    const fieldErrors = getCreateProjectFieldErrors(parsed.error);
    const issueFields = Object.keys(fieldErrors) as CreateProjectFieldName[];

    logger.warn("project.create_invalid_payload", {
      area: "projects",
      action: "create_project",
      result: "rejected",
      actorUserId: actor.id,
      role: actor.role,
      reason: "invalid_payload",
      issueCount: parsed.error.issues.length,
      issueFields: issueFields?.length > 0 ? issueFields : undefined,
    });

    return {
      errorMessage:
        parsed.error.issues[0]?.message ?? "Data project tidak valid.",
      fieldErrors,
    };
  }

  const projectInput = parsed.data;

  let createdProjectId: string | null = null;

  try {
    const project = await prisma.project.create({
      data: {
        name: projectInput.name,
        description: projectInput.description,
        startDate: projectInput.startDate,
        endDate: projectInput.endDate,
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

    logger.error(
      "project.create_failed",
      {
        area: "projects",
        action: "create_project",
        result: "failed",
        actorUserId: actor.id,
        role: actor.role,
        reason: "database_write_failed",
      },
      error,
    );

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
