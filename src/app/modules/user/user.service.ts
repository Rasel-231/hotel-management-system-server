import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import bcrypt from 'bcrypt';
import config from '../../../config';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/ApiError';
import { buildWhere } from '../../../shared/paginationHelper';
import { IUserCreateInput, IUserUpdateInput, IUserAdminUpdateInput } from './user.interface';
import { generateOtp, generateTokens, toUserResponse } from '../../../utils/generateToken';
import { redisClient } from '../../../database/redis';
import { sendEmailHelper } from '../../../shared/sendEmail';
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
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError('This Email is already registered', StatusCodes.CONFLICT);
  }
  const passwordHash = await bcrypt.hash(payload.password, config.salt_rounds);
  const user = await prisma.user.create({
    data: {
      name: payload.name.trim(),
      email,
      passwordHash,
      role: 'USER',
      phone: payload.phone,
      address: payload.address,
    },
  });

  const otp = generateOtp();
  await redisClient.set(`otp:${user.email}`, otp, 5 * 60);
  const tokens = await generateTokens({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion });

  await sendEmailHelper.sendEmail(
    user.email,
    'Verify your account',
    `<p>Your verification OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
  );
  return { ...tokens, user: toUserResponse(user) };
};

const getProfile = async (userId: string) => {
  return prisma.user.findUniqueOrThrow({ where: { id: userId }, select: userSelect });
};

const updateProfile = async (userId: string, payload: IUserUpdateInput) => {
  await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return prisma.user.update({ where: { id: userId }, data: payload, select: userSelect });
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
  await prisma.user.findUniqueOrThrow({ where: { id } });
  return prisma.user.update({ where: { id }, data: payload, select: userSelect });
};

const deleteUser = async (id: string) => {
  await prisma.user.findUniqueOrThrow({ where: { id } });
  return prisma.user.delete({ where: { id } });
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
