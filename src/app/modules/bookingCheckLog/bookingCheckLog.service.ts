import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { buildWhere } from '../../../shared/paginationHelper';
import { TBookingCheckLogCreate, TBookingCheckLogUpdate } from './bookingCheckLog.interface';

const getAll = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildWhere({
    query,
    searchableFields: [],
  });

  const [data, total] = await prisma.$transaction([
    prisma.bookingCheckLog.findMany({
      where: where as Prisma.BookingCheckLogWhereInput,
      orderBy: orderBy as Prisma.BookingCheckLogOrderByWithRelationInput,
      skip,
      take,
    }),
    prisma.bookingCheckLog.count({ where: where as Prisma.BookingCheckLogWhereInput }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getById = async (id: string) => {
  return prisma.bookingCheckLog.findUniqueOrThrow({ where: { id } });
};

const create = async (payload: TBookingCheckLogCreate) => {
  return prisma.bookingCheckLog.create({ data: payload });
};

const update = async (id: string, payload: TBookingCheckLogUpdate) => {
  await prisma.bookingCheckLog.findUniqueOrThrow({ where: { id } });
  return prisma.bookingCheckLog.update({ where: { id }, data: payload });
};

const remove = async (id: string) => {
  await prisma.bookingCheckLog.findUniqueOrThrow({ where: { id } });
  return prisma.bookingCheckLog.delete({ where: { id } });
};

export const BookingCheckLogService = { getAll, getById, create, update, remove };
