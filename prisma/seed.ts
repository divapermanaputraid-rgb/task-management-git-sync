import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { logger } from "../src/lib/logger";

const seedUser = [
  {
    name: "PM Admin",
    email: "pmadmin@newus.com",
    role: "PM_ADMIN",
  },
  {
    name: "Developer 1",
    email: "dev1@newus.com",
    role: "DEVELOPER",
  },
  {
    name: "Developer 2",
    email: "dev2@newus.com",
    role: "DEVELOPER",
  },
] as const;

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} harus diisi.`);
  }

  return value;
}

const adapter = new PrismaPg({
  connectionString: requireEnv("DATABASE_URL"),
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const seedDefaultPassword = requireEnv("SEED_DEFAULT_PASSWORD");
  const passwordHash = await bcrypt.hash(seedDefaultPassword, 10);

  for (const user of seedUser) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        role: user.role,
        passwordHash,
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash,
      },
    });
  }

  logger.info("seed.completed", {
    area: "seed",
    action: "auth_baseline",
    result: "succeeded",
  });
}

main()
  .catch((error) => {
    logger.error(
      "seed.failed",
      {
        area: "seed",
        action: "auth_baseline",
        result: "failed",
        reason: "database_or_seed_error",
      },
      error,
    );
    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });
