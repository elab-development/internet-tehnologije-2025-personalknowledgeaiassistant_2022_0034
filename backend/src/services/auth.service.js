import prisma from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (data) => {
  const exists = await prisma.user.findUnique({ where: { username: data.username } });
  if (exists) return { error: 'User already exists', status: 409 };

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword }
  });

  return {
    token: generateToken({ id: user.id, role: user.role }),
    user
  };
};

export const login = async (username, password) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: 'Invalid credentials', status: 401 };

  const valid = await comparePassword(password, user.password);
  if (!valid) return { error: 'Invalid credentials', status: 401 };

  return {
    token: generateToken({ id: user.id, role: user.role }),
    user
  };
};