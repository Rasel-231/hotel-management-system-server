import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/ApiError';
import { buildWhere } from '../../../shared/paginationHelper';
import { TRoomHousekeepingCreate, TRoomHousekeepingUpdate } from './roomHousekeeping.interface';

const getAll = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildWhere({
    query,
    searchableFields: [],
  });

  const [data, total] = await prisma.$transaction([
    prisma.roomHousekeeping.findMany({
      where: where as Prisma.RoomHousekeepingWhereInput,
      orderBy: orderBy as Prisma.RoomHousekeepingOrderByWithRelationInput,
      skip,
      take,
    }),
    prisma.roomHousekeeping.count({ where: where as Prisma.RoomHousekeepingWhereInput }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getById = async (id: string) => {
  return prisma.roomHousekeeping.findUniqueOrThrow({ where: { id } });
};

const create = async (payload: TRoomHousekeepingCreate) => {
  const existing = await prisma.roomHousekeeping.findUnique({
    where: { roomId: payload.roomId },
  });
  if (existing) {
    throw new ApiError('Housekeeping record already exists for this room', StatusCodes.CONFLICT);
  }
  return prisma.roomHousekeeping.create({ data: payload });
};

const update = async (id: string, payload: TRoomHousekeepingUpdate) => {
  await prisma.roomHousekeeping.findUniqueOrThrow({ where: { id } });
  return prisma.roomHousekeeping.update({ where: { id }, data: payload });
};

const remove = async (id: string) => {
  await prisma.roomHousekeeping.findUniqueOrThrow({ where: { id } });
  return prisma.roomHousekeeping.delete({ where: { id } });
};

export const RoomHousekeepingService = { getAll, getById, create, update, remove };
