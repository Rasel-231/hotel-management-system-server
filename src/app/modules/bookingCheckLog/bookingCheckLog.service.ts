import prisma from '../../../shared/prisma.client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/api.error';
import { Prisma } from '@prisma/client';
import { buildWhere } from '../../../shared/pagination.helper';
import { TBookingCheckLogCreate, TBookingCheckLogUpdate } from './bookingCheckLog.interface';

const assertStaffExists = async (staffId?: unknown): Promise<void> => {
  if (typeof staffId !== 'string' || !staffId) return;
  const staff = await prisma.hotelStaff.findUnique({ where: { id: staffId } });
  if (!staff) {
    throw new ApiError(`HotelStaff '${staffId}' not found.`, StatusCodes.BAD_REQUEST);
  }
};

const getAll = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildWhere({
    query,
    searchableFields: ['id'],
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
  const log = await prisma.bookingCheckLog.findUnique({ where: { id } });
  if (!log) throw new ApiError(`BookingCheckLog '${id}' not found.`, StatusCodes.NOT_FOUND);
  return log;
};

const create = async (payload: TBookingCheckLogCreate) => {
  const booking = await prisma.booking.findUnique({ where: { id: payload.bookingId } });
  if (!booking) {
    throw new ApiError(`Booking '${payload.bookingId}' not found.`, StatusCodes.NOT_FOUND);
  }

  const existing = await prisma.bookingCheckLog.findFirst({
    where: { bookingId: payload.bookingId },
  });
  if (existing) {
    throw new ApiError(
      'A check log already exists for this booking. Use update instead.',
      StatusCodes.CONFLICT
    );
  }

  await assertStaffExists(payload.handledBy);
  return prisma.bookingCheckLog.create({ data: payload });
};

const update = async (id: string, payload: TBookingCheckLogUpdate) => {
  const existing = await prisma.bookingCheckLog.findUnique({ where: { id } });
  if (!existing) throw new ApiError(`BookingCheckLog '${id}' not found.`, StatusCodes.NOT_FOUND);

  const targetBookingId = typeof payload.bookingId === 'string' ? payload.bookingId : undefined;
  if (targetBookingId && targetBookingId !== existing.bookingId) {
    const booking = await prisma.booking.findUnique({ where: { id: targetBookingId } });
    if (!booking) {
      throw new ApiError(`Booking '${targetBookingId}' not found.`, StatusCodes.NOT_FOUND);
    }
  }

  await assertStaffExists(payload.handledBy);
  return prisma.bookingCheckLog.update({ where: { id }, data: payload });
};

const remove = async (id: string) => {
  const existing = await prisma.bookingCheckLog.findUnique({ where: { id } });
  if (!existing) throw new ApiError(`BookingCheckLog '${id}' not found.`, StatusCodes.NOT_FOUND);
  return prisma.bookingCheckLog.delete({ where: { id } });
};

export const BookingCheckLogService = { getAll, getById, create, update, remove };