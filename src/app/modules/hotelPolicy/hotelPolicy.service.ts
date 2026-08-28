import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/ApiError';
import { buildWhere } from '../../../shared/paginationHelper';
import { THotelPolicyCreate, THotelPolicyUpdate } from './hotelPolicy.interface';

const getAll = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildWhere({
    query,
    searchableFields: [],
  });

  const [data, total] = await prisma.$transaction([
    prisma.hotelPolicy.findMany({
      where: where as Prisma.HotelPolicyWhereInput,
      orderBy: orderBy as Prisma.HotelPolicyOrderByWithRelationInput,
      skip,
      take,
    }),
    prisma.hotelPolicy.count({ where: where as Prisma.HotelPolicyWhereInput }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getById = async (id: string) => {
  return prisma.hotelPolicy.findUniqueOrThrow({ where: { id } });
};

const create = async (payload: THotelPolicyCreate) => {
  const existing = await prisma.hotelPolicy.findUnique({
    where: { hotelId: payload.hotelId },
  });
  if (existing) {
    throw new ApiError('Policy already exists for this hotel', StatusCodes.CONFLICT);
  }
  return prisma.hotelPolicy.create({ data: payload });
};

const update = async (id: string, payload: THotelPolicyUpdate) => {
  await prisma.hotelPolicy.findUniqueOrThrow({ where: { id } });
  return prisma.hotelPolicy.update({ where: { id }, data: payload });
};

const remove = async (id: string) => {
  await prisma.hotelPolicy.findUniqueOrThrow({ where: { id } });
  return prisma.hotelPolicy.delete({ where: { id } });
};

export const HotelPolicyService = { getAll, getById, create, update, remove };
