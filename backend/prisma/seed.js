import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      password,
      role: "ADMIN",
    },
  });

  const models = [
    { modelName: "qwen7", usage: 120 },
    { modelName: "qwen1", usage: 85 },
    { modelName: "llama", usage: 60 },
    { modelName: "gemma2", usage: 40 },
  ];

  for (const model of models) {
    await prisma.modelStats.upsert({
      where: { modelName: model.modelName },
      update: {},
      create: {
        modelName: model.modelName,
        usage: model.usage,
      },
    });
  }

  console.log("Seed user and model stats ensured");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
