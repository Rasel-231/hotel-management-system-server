import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/ApiError';
import { buildWhere } from '../../../shared/paginationHelper';
import { THotelStaffCreate, THotelStaffUpdate } from './hotelStaff.interface';

const getAll = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildWhere({
    query,
    searchableFields: [],
  });

  const [data, total] = await prisma.$transaction([
    prisma.hotelStaff.findMany({
      where: where as Prisma.HotelStaffWhereInput,
      orderBy: orderBy as Prisma.HotelStaffOrderByWithRelationInput,
      skip,
      take,
    }),
    prisma.hotelStaff.count({ where: where as Prisma.HotelStaffWhereInput }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getById = async (id: string) => {
  return prisma.hotelStaff.findUniqueOrThrow({ where: { id } });
};

const create = async (payload: THotelStaffCreate) => {
  const existing = await prisma.hotelStaff.findUnique({
    where: { hotelId_userId: { hotelId: payload.hotelId, userId: payload.userId } },
  });
  if (existing) {
    throw new ApiError('This user is already staff for this hotel', StatusCodes.CONFLICT);
  }
  return prisma.hotelStaff.create({ data: payload });
};

const update = async (id: string, payload: THotelStaffUpdate) => {
  await prisma.hotelStaff.findUniqueOrThrow({ where: { id } });
  return prisma.hotelStaff.update({ where: { id }, data: payload });
};

const remove = async (id: string) => {
  await prisma.hotelStaff.findUniqueOrThrow({ where: { id } });
  return prisma.hotelStaff.delete({ where: { id } });
};

export const HotelStaffService = { getAll, getById, create, update, remove };
