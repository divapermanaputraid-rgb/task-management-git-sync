import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

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

  await prisma.user.upsert({
    where: {
      email: "pmadmin@newus.com",
    },
    update: {
      name: "PM Admin",
      role: "PM_ADMIN",
      passwordHash,
    },
    create: {
      name: "PM Admin",
      email: "pmadmin@newus.com",
      role: "PM_ADMIN",
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "dev1@newus.com",
    },
    update: {
      name: "Developer 1",
      role: "DEVELOPER",
      passwordHash,
    },
    create: {
      name: "Developer 1",
      email: "dev1@newus.com",
      role: "DEVELOPER",
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: {
      email: "dev2@newus.com",
    },
    update: {
      name: "Developer 2",
      role: "DEVELOPER",
      passwordHash,
    },
    create: {
      name: "Developer 2",
      email: "dev2@newus.com",
      role: "DEVELOPER",
      passwordHash,
    },
  });

  console.log("Seed user baseline berhasil dibuat.");
}

main()
  .catch((error) => {
    console.error("Seed gagal dijalankan.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
