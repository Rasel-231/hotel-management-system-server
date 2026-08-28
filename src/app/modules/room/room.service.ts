import prisma from '../../../shared/prisma.client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/api.error';
import { Prisma, Room } from '@prisma/client';
import { datesBetween } from '../../../shared/booking.lock';

const getRoomsByHotel = async (hotelId: string): Promise<Room[]> => {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });

  if (!hotel) {
    throw new ApiError(`Hotel with ID '${hotelId}' is not found.`, StatusCodes.NOT_FOUND);
  }

  return prisma.room.findMany({
    where: { hotelId },
    orderBy: { createdAt: 'desc' },
  });
};

const getRoomAvailability = async (roomId: string) => {
  const room = await prisma.room.findUnique({ where: { id: roomId } });

  if (!room) {
    throw new ApiError(`Room with ID '${roomId}' is not found.`, StatusCodes.NOT_FOUND);
  }

  return prisma.roomAvailability.findMany({
    where: { roomId },
    orderBy: { date: 'asc' },
  });
};

const createRoom = async (
  payload: Prisma.RoomUncheckedCreateInput,
  userId: string
): Promise<Room> => {
  const hotel = await prisma.hotel.findUnique({ where: { id: payload.hotelId } });

  if (!hotel) {
    throw new ApiError(`Hotel with ID '${payload.hotelId}' is not found.`, StatusCodes.NOT_FOUND);
  }

  if (hotel.ownerId !== userId) {
    throw new ApiError('You are not authorized to add rooms to this hotel.', StatusCodes.FORBIDDEN);
  }

  return prisma.room.create({ data: payload });
};

const updateRoom = async (
  id: string,
  payload: Prisma.RoomUncheckedUpdateInput,
  userId: string
): Promise<Room> => {
  const room = await prisma.room.findUnique({ where: { id } });

  if (!room) {
    throw new ApiError(`Room with ID '${id}' is not found.`, StatusCodes.NOT_FOUND);
  }

  const hotel = await prisma.hotel.findUnique({ where: { id: room.hotelId } });

  if (!hotel || hotel.ownerId !== userId) {
    throw new ApiError('You are not authorized to update this room.', StatusCodes.FORBIDDEN);
  }

  return prisma.room.update({ where: { id }, data: payload });
};

const assertRoomAccess = async (roomId: string, userId: string): Promise<Room> => {
  const room = await prisma.room.findUnique({ where: { id: roomId }, include: { hotel: true } });
  if (!room) throw new ApiError(`Room '${roomId}' not found.`, StatusCodes.NOT_FOUND);
  const isOwner = room.hotel.ownerId === userId;
  const isStaff = !!(await prisma.hotelStaff.findUnique({
    where: { hotelId_userId: { hotelId: room.hotelId, userId } },
  }));
  if (!isOwner && !isStaff) {
    throw new ApiError('Forbidden: no access to this room', StatusCodes.FORBIDDEN);
  }
  return room;
};

const blockDates = async (
  roomId: string,
  userId: string,
  payload: { startDate: string; endDate: string }
) => {
  const room = await assertRoomAccess(roomId, userId);
  const dates = datesBetween(new Date(payload.startDate), new Date(payload.endDate));
  await prisma.$transaction(
    dates.map((d) =>
      prisma.roomAvailability.upsert({
        where: { roomId_date: { roomId, date: new Date(d) } },
        create: { roomId, date: new Date(d), isBooked: true },
        update: { isBooked: true },
      })
    )
  );
  return { blocked: dates.length, hotelId: room.hotelId };
};

const unblockDates = async (
  roomId: string,
  userId: string,
  payload: { startDate: string; endDate: string }
) => {
  await assertRoomAccess(roomId, userId);
  const dates = datesBetween(new Date(payload.startDate), new Date(payload.endDate));
  await prisma.$transaction(
    dates.map((d) =>
      prisma.roomAvailability.upsert({
        where: { roomId_date: { roomId, date: new Date(d) } },
        create: { roomId, date: new Date(d), isBooked: false },
        update: { isBooked: false },
      })
    )
  );
  return { unblocked: dates.length };
};

export const RoomService = {
  getRoomsByHotel,
  getRoomAvailability,
  createRoom,
  updateRoom,
  blockDates,
  unblockDates,
};
