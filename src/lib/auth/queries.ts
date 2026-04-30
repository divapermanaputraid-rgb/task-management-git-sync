import type { AppRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

const authUserSelect = {
  id: true,
  name: true,
  email: true,
  passwordHash: true,
  role: true,
  githubAccountId: true,
} as const;

type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string | null;
  role: AppRole;
  githubAccountId: string | null;
};

type ResolveGithubUserPlan =
  | {
      kind: "use_linked_user";
      user: AuthUser;
    }
  | {
      kind: "link_email_user";
      userId: string;
      name: string | null;
      githubAccountId: string;
    }
  | {
      kind: "create_user";
      email: string;
      name: string | null;
      role: "DEVELOPER";
      githubAccountId: string;
    }
  | {
      kind: "identity_conflict";
    };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeGithubName(name?: string | null) {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return null;
  }

  return trimmedName.slice(0, 100);
}

function isUniqueConstraintError(error: unknown) {
  const errorWithCode = error as { code?: unknown };

  return errorWithCode.code === "P2002";
}

export function planGithubUserResolution(params: {
  githubAccountId: string;
  email: string;
  name?: string | null;
  existingLinkedUser: AuthUser | null;
  existingUserByEmail: AuthUser | null;
}): ResolveGithubUserPlan {
  const normalizedEmail = normalizeEmail(params.email);
  const normalizedName = normalizeGithubName(params.name);

  if (params.existingLinkedUser) {
    return {
      kind: "use_linked_user",
      user: params.existingLinkedUser,
    };
  }

  if (!params.existingUserByEmail) {
    return {
      kind: "create_user",
      email: normalizedEmail,
      name: normalizedName,
      role: "DEVELOPER",
      githubAccountId: params.githubAccountId,
    };
  }

  if (params.existingUserByEmail.githubAccountId === null) {
    return {
      kind: "link_email_user",
      userId: params.existingUserByEmail.id,
      name: params.existingUserByEmail.name ?? normalizedName,
      githubAccountId: params.githubAccountId,
    };
  }

  if (params.existingUserByEmail.githubAccountId === params.githubAccountId) {
    return {
      kind: "use_linked_user",
      user: params.existingUserByEmail,
    };
  }

  return { kind: "identity_conflict" };
}

export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: authUserSelect,
    });
  } catch (error) {
    logger.error(
      "auth.user_lookup_failed",
      {
        area: "auth",
        action: "get_user_by_email",
        result: "failed",
        reason: "database_error",
      },
      error,
    );
    throw error;
  }
}

export async function resolveGithubUser(params: {
  githubAccountId: string;
  email: string;
  name?: string | null;
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existingLinkedUser = await tx.user.findUnique({
        where: { githubAccountId: params.githubAccountId },
        select: authUserSelect,
      });

      const existingUserByEmail = await tx.user.findUnique({
        where: { email: normalizeEmail(params.email) },
        select: authUserSelect,
      });

      const plan = planGithubUserResolution({
        githubAccountId: params.githubAccountId,
        email: params.email,
        name: params.name,
        existingLinkedUser,
        existingUserByEmail,
      });

      if (plan.kind === "identity_conflict") {
        return { ok: false as const, reason: "identity_conflict" as const };
      }

      if (plan.kind === "use_linked_user") {
        return { ok: true as const, user: plan.user };
      }

      if (plan.kind === "link_email_user") {
        const linkedEmailUser = await tx.user.update({
          where: { id: plan.userId },
          data: {
            githubAccountId: plan.githubAccountId,
            name: plan.name,
          },
          select: authUserSelect,
        });

        return { ok: true as const, user: linkedEmailUser };
      }

      const createdUser = await tx.user.create({
        data: {
          email: plan.email,
          name: plan.name,
          role: plan.role,
          githubAccountId: plan.githubAccountId,
        },
        select: authUserSelect,
      });

      return { ok: true as const, user: createdUser };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false as const, reason: "identity_conflict" as const };
    }

    logger.error(
      "auth.github_user_resolution_failed",
      {
        area: "auth",
        action: "resolve_github_user",
        result: "failed",
        reason: "database_error",
      },
      error,
    );
    throw error;
  }
}
