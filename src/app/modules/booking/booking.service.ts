import prisma from '../../../shared/prisma';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/ApiError';
import { Prisma, Booking } from '@prisma/client';

const createBooking = async (
  payload: Prisma.BookingUncheckedCreateInput,
  userId: string
): Promise<Booking> => {
  const room = await prisma.room.findUnique({ where: { id: payload.roomId } });

  if (!room) {
    throw new ApiError(`Room with ID '${payload.roomId}' is not found.`, StatusCodes.NOT_FOUND);
  }

  const booking = await prisma.booking.create({
    data: { ...payload, userId, status: 'PENDING' },
  });

  await prisma.roomAvailability.updateMany({
    where: {
      roomId: payload.roomId,
      date: { gte: payload.checkIn, lt: payload.checkOut },
    },
    data: { isBooked: true },
  });

  return booking;
};

const getMyBookings = async (userId: string): Promise<Booking[]> => {
  return prisma.booking.findMany({
    where: { userId },
    include: { room: true },
    orderBy: { createdAt: 'desc' },
  });
};

const getBookingById = async (id: string, userId: string, role: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: { include: { hotel: true } } },
  });

  if (!booking) {
    throw new ApiError(`Booking with ID '${id}' is not found.`, StatusCodes.NOT_FOUND);
  }

  const isAdmin = role === 'ADMIN';
  const isOwner = booking.room?.hotel?.ownerId === userId;
  const isOwnerSelf = booking.userId === userId;

  if (!isAdmin && !isOwner && !isOwnerSelf) {
    throw new ApiError('You are not authorized to view this booking.', StatusCodes.FORBIDDEN);
  }

  return booking;
};

const cancelBooking = async (id: string, userId: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    throw new ApiError(`Booking with ID '${id}' is not found.`, StatusCodes.NOT_FOUND);
  }

  if (booking.userId !== userId) {
    throw new ApiError('You are not authorized to cancel this booking.', StatusCodes.FORBIDDEN);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  await prisma.roomAvailability.updateMany({
    where: {
      roomId: booking.roomId,
      date: { gte: booking.checkIn, lt: booking.checkOut },
    },
    data: { isBooked: false },
  });

  return updated;
};

const getOwnerBookings = async (userId: string): Promise<Booking[]> => {
  return prisma.booking.findMany({
    where: { room: { hotel: { ownerId: userId } } },
    include: { room: true, user: true },
    orderBy: { createdAt: 'desc' },
  });
};

const checkInBooking = async (id: string, userId: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: { include: { hotel: true } } },
  });

  if (!booking) {
    throw new ApiError(`Booking with ID '${id}' is not found.`, StatusCodes.NOT_FOUND);
  }

  if (booking.room?.hotel?.ownerId !== userId) {
    throw new ApiError('You are not authorized to check in this booking.', StatusCodes.FORBIDDEN);
  }

  return prisma.booking.update({
    where: { id },
    data: { status: 'CHECKED_IN' },
  });
};

export const BookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings,
  checkInBooking,
};
