import prisma from "../config/prisma.js";

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
  return user;
};

export const updateProfile = async (id, data) => {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return user;
};

export const adminUpdateUser = async (userId, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      password: data.password,
      role: data.role,
    },
  });
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

  return users;
};
