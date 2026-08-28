import prisma from '../../../shared/prisma.client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/api.error';
import { Prisma, Role, User } from '@prisma/client';

const getAllUsers = async (query: {
  searchTerm?: string;
  page?: string | number;
  limit?: string | number;
}) => {
  const where: Prisma.UserWhereInput = {};

  if (query.searchTerm) {
    where.OR = [
      { name: { contains: query.searchTerm, mode: 'insensitive' } },
      { email: { contains: query.searchTerm, mode: 'insensitive' } },
    ];
  }

  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const assignRole = async (userId: string, role: Role): Promise<User> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(`User with ID '${userId}' is not found.`, StatusCodes.NOT_FOUND);
  }

  return prisma.user.update({ where: { id: userId }, data: { role } });
};

const getAnalytics = async () => {
  const [totalUsers, totalHotels, totalRooms, totalBookings, totalReviews] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.hotel.count(),
      prisma.room.count(),
      prisma.booking.count(),
      prisma.review.count(),
    ]);

  const revenue = await prisma.booking.aggregate({
    _sum: { totalPrice: true },
    where: { status: { not: 'CANCELLED' } },
  });

  return {
    totalUsers,
    totalHotels,
    totalRooms,
    totalBookings,
    totalReviews,
    totalRevenue: revenue._sum.totalPrice ?? 0,
  };
};

const getRolesPermissions = async () => {
  return prisma.permission.findMany();
};

export const AdminService = {
  getAllUsers,
  assignRole,
  getAnalytics,
  getRolesPermissions,
};
