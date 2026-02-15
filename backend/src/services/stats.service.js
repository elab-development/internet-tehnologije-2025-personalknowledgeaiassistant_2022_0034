import prisma from "../config/prisma.js";

export const incrementUsage = async (modelName) => {
  const lowerModelName = modelName.toLowerCase();

  const existing = await prisma.modelStats.findUnique({
    where: { modelName: lowerModelName },
  });

  if (existing) {
    return prisma.modelStats.update({
      where: { modelName: lowerModelName },
      data: { usage: { increment: 1 } },
    });
  } else {
    return prisma.modelStats.create({
      data: { modelName: lowerModelName, usage: 1 },
    });
  }
};

export const getAllStats = async () => {
  return prisma.modelStats.findMany({
    orderBy: { usage: "desc" },
  });
};
