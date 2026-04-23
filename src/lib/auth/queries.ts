import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";

export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
      },
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
