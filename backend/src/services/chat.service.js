import prisma from "../config/prisma.js";

export const createChat = async (userId, title) => {
  return prisma.chat.create({
    data: { userId, title: title || "New Chat" },
  });
};

export const getChats = async (userId) => {
  return prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      questions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

export const getChatById = async (chatId, userId) => {
  return prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: userId,
    },
    include: {
      questions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

export const deleteChat = async (chatId, userId) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: userId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found or access denied");
  }

  return prisma.chat.delete({
    where: { id: chatId },
  });
};
