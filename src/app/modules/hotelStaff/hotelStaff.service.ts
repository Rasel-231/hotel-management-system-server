import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma.client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/api.error';
import { buildWhere } from '../../../shared/pagination.helper';
import { THotelStaffCreate, THotelStaffUpdate } from './hotelStaff.interface';
import { notify } from '../../../shared/notification.helper';

const assertOwner = async (hotelId: string, ownerId: string) => {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) throw new ApiError(`Hotel '${hotelId}' not found.`, StatusCodes.NOT_FOUND);
  if (hotel.ownerId !== ownerId) {
    throw new ApiError('Forbidden: you do not own this hotel', StatusCodes.FORBIDDEN);
  }
};

const invite = async (
  hotelId: string,
  ownerId: string,
  payload: { email?: string; userId?: string; subRole: 'MANAGER' | 'FRONT_DESK' | 'HOUSEKEEPING'; permissions?: string[] }
) => {
  await assertOwner(hotelId, ownerId);

  const user = payload.email
    ? await prisma.user.findUnique({ where: { email: payload.email } })
    : await prisma.user.findUnique({ where: { id: payload.userId! } });
  if (!user) throw new ApiError('Invited user not found', StatusCodes.NOT_FOUND);

  const existing = await prisma.hotelStaff.findUnique({
    where: { hotelId_userId: { hotelId, userId: user.id } },
  });
  if (existing) throw new ApiError('User is already staff for this hotel', StatusCodes.CONFLICT);

  const staff = await prisma.hotelStaff.create({
    data: { hotelId, userId: user.id, subRole: payload.subRole, permissions: payload.permissions ?? [] },
  });
  await notify(user.id, 'STAFF_INVITE', { hotelId, subRole: payload.subRole });
  return staff;
};

const listByHotel = async (hotelId: string, ownerId: string) => {
  await assertOwner(hotelId, ownerId);
  return prisma.hotelStaff.findMany({ where: { hotelId }, include: { user: true } });
};

const revoke = async (staffId: string, ownerId: string) => {
  const staff = await prisma.hotelStaff.findUnique({ where: { id: staffId }, include: { hotel: true } });
  if (!staff) throw new ApiError('Staff record not found', StatusCodes.NOT_FOUND);
  if (staff.hotel.ownerId !== ownerId) {
    throw new ApiError('Forbidden: you do not own this hotel', StatusCodes.FORBIDDEN);
  }
  return prisma.hotelStaff.delete({ where: { id: staffId } });
};

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

export const HotelStaffService = { getAll, getById, create, update, remove, invite, listByHotel, revoke };
