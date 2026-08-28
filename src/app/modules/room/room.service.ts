import prisma from '../../../shared/prisma';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/ApiError';
import { Prisma, Room } from '@prisma/client';

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

export const RoomService = {
  getRoomsByHotel,
  getRoomAvailability,
  createRoom,
  updateRoom,
};
