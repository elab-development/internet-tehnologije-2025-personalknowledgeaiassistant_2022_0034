import prisma from '../config/prisma.js';

export const getProfile = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true
    }
  });

  if (!user) return { error: 'User not found', status: 404 };
  return user;
};

export const updateProfile = async (id, data) => {
  const user = await prisma.user.update({
    where: { id },
    data
  });
  return user;
};
