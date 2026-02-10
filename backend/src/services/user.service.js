import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import xss from "xss";

export const getProfile = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return { error: "User not found", status: 404 };

  return {
    ...user,
    username: xss(user.username),
    firstName: xss(user.firstName),
    lastName: xss(user.lastName),
    role: xss(user.role),
  };
};

export const updateProfile = async (id, data) => {
  const safeData = {
    ...data,
    username: data.username ? xss(data.username) : undefined,
    firstName: data.firstName ? xss(data.firstName) : undefined,
    lastName: data.lastName ? xss(data.lastName) : undefined,
  };

  const user = await prisma.user.update({
    where: { id },
    data: safeData,
  });

  return {
    ...user,
    username: xss(user.username),
    firstName: xss(user.firstName),
    lastName: xss(user.lastName),
    role: xss(user.role),
  };
};

export const adminUpdateUser = async (userId, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const safeData = {
    firstName: data.firstName ? xss(data.firstName) : undefined,
    lastName: data.lastName ? xss(data.lastName) : undefined,
    username: data.username ? xss(data.username) : undefined,
    password: data.password,
    role: data.role ? xss(data.role) : undefined,
  };

  const user = await prisma.user.update({
    where: { id: userId },
    data: safeData,
  });

  return {
    ...user,
    username: xss(user.username),
    firstName: xss(user.firstName),
    lastName: xss(user.lastName),
    role: xss(user.role),
  };
};

export const adminDeleteUser = async (userId) => {
  return prisma.user.delete({
    where: { id: userId },
  });
};

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  return users.map((user) => ({
    ...user,
    username: xss(user.username),
    firstName: xss(user.firstName),
    lastName: xss(user.lastName),
    role: xss(user.role),
  }));
};
