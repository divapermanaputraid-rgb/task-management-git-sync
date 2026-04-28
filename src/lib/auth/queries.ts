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
  const normalizedEmail = normalizeEmail(params.email);
  const normalizedName = normalizeGithubName(params.name);

  try {
    return await prisma.$transaction(async (tx) => {
      const linkedUser = await tx.user.findUnique({
        where: { githubAccountId: params.githubAccountId },
        select: authUserSelect,
      });

      if (linkedUser) {
        return { ok: true as const, user: linkedUser };
      }

      const emailUser = await tx.user.findUnique({
        where: { email: normalizedEmail },
        select: authUserSelect,
      });

      if (emailUser) {
        if (
          emailUser.githubAccountId &&
          emailUser.githubAccountId !== params.githubAccountId
        ) {
          return { ok: false as const, reason: "identity_conflict" as const };
        }

        const linkedEmailUser = await tx.user.update({
          where: { id: emailUser.id },
          data: {
            githubAccountId: params.githubAccountId,
            name: emailUser.name ?? normalizedName,
          },
          select: authUserSelect,
        });

        return { ok: true as const, user: linkedEmailUser };
      }

      const createdUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: normalizedName,
          role: "DEVELOPER",
          githubAccountId: params.githubAccountId,
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
