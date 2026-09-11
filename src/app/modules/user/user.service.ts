import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma.client';
import bcrypt from 'bcrypt';
import config from '../../../config';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/api.error';
import { buildWhere } from '../../../shared/pagination.helper';
import { IUserCreateInput, IUserUpdateInput, IUserAdminUpdateInput } from './user.interface';
import { generateTokens, toUserResponse } from '../../../utils/generateToken';
import { IAuthResult } from '../auth/auth.interface';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  isVerified: true,
  address: true,
  createdAt: true,
} as const;


const registerUser = async (payload: IUserCreateInput): Promise<IAuthResult> => {
  const email = payload.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(payload.password, config.salt_rounds);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: payload.name.trim(),
        email,
        passwordHash,
        role: 'USER',
        phone: payload.phone,
        address: payload.address,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ApiError('This Email is already registered', StatusCodes.CONFLICT);
    }
    throw err;
  }

  const tokens = await generateTokens({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion });

  return { ...tokens, user: toUserResponse(user) };
};

const getProfile = async (userId: string) => {
  return prisma.user.findUniqueOrThrow({ where: { id: userId }, select: userSelect });
};

const updateProfile = async (userId: string, payload: IUserUpdateInput) => {
  const { name, phone, address } = payload as {
    name?: string;
    phone?: string;
    address?: string;
  };

  try {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
      select: userSelect,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new ApiError('User not found', StatusCodes.NOT_FOUND);
    }
    throw err;
  }
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildWhere({
    query,
    searchableFields: ['name', 'email'],
  });

  const filters = where as Record<string, unknown>;
  if (query.isVerified !== undefined) {
    filters.isVerified = query.isVerified === 'true';
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: filters as Prisma.UserWhereInput,
      orderBy,
      skip,
      take,
      select: userSelect,
    }),
    prisma.user.count({ where: filters as Prisma.UserWhereInput }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getById = async (id: string) => {
  return prisma.user.findUniqueOrThrow({ where: { id }, select: userSelect });
};

const updateUser = async (id: string, payload: IUserAdminUpdateInput) => {
  try {
    return await prisma.user.update({ where: { id }, data: payload, select: userSelect });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new ApiError('User not found', StatusCodes.NOT_FOUND);
    }
    throw err;
  }
};

const deleteUser = async (id: string) => {
  try {
    return await prisma.user.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new ApiError('User not found', StatusCodes.NOT_FOUND);
    }
    throw err;
  }
};

export const UserService = {
  registerUser,
  getProfile,
  updateProfile,
  getAllUsers,
  getById,
  updateUser,
  deleteUser,
};