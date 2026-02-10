import prisma from '../config/prisma.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import xss from 'xss';

export const register = async (data) => {
  const exists = await prisma.user.findUnique({ where: { username: xss(data.username) } });
  if (exists) return { error: 'User already exists', status: 409 };

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: { 
      ...data, 
      username: xss(data.username),
      firstName: xss(data.firstName),
      lastName: xss(data.lastName),
      password: hashedPassword 
    }
  });

  return {
    token: generateToken({ id: user.id, role: user.role }),
    user
  };
};

export const login = async (username, password) => {
  const user = await prisma.user.findUnique({ where: { username: xss(username) } });
  if (!user) return { error: 'Invalid credentials', status: 401 };

  const valid = await comparePassword(password, user.password);
  if (!valid) return { error: 'Invalid credentials', status: 401 };

  return {
    token: generateToken({ id: user.id, role: user.role }),
    user
  };
};
