import prisma from "../config/prisma.js";
import xss from "xss";

export const createChat = async (userId, title) => {
  return prisma.chat.create({
    data: { 
      userId, 
      title: xss(title) || "New Chat"
    },
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
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  // IDOR zaštita
  if (chat.userId !== userId) {
    throw new Error("Access denied");
  }

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
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  // IDOR zaštita
  if (chat.userId !== userId) {
    throw new Error("Access denied");
  }

  return prisma.chat.delete({
    where: { id: chatId },
  });
};
