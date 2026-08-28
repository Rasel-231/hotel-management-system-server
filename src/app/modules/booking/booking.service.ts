import prisma from '../../../shared/prisma.client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/api.error';
import { Prisma, Booking } from '@prisma/client';
import { acquireBookingLocks, releaseBookingLocks, datesBetween } from '../../../shared/booking.lock';
import { refundQueue } from '../../../shared/queue.manager';
import { PricingRuleService } from '../pricingRule/pricingRule.service';

const createBooking = async (
  payload: Prisma.BookingUncheckedCreateInput,
  userId: string
): Promise<Booking> => {
  const room = await prisma.room.findUnique({ where: { id: payload.roomId } });
  if (!room) {
    throw new ApiError(`Room with ID '${payload.roomId}' is not found.`, StatusCodes.NOT_FOUND);
  }

  const checkIn = new Date(payload.checkIn);
  const checkOut = new Date(payload.checkOut);
  if (checkOut <= checkIn) {
    throw new ApiError('Check-out must be after check-in', StatusCodes.BAD_REQUEST);
  }

  const dates = datesBetween(checkIn, checkOut);
  const locked = await acquireBookingLocks(payload.roomId, dates);
  if (!locked) {
    throw new ApiError('Room is not available for the selected dates', StatusCodes.CONFLICT);
  }

  const totalPrice = await PricingRuleService.calculateEffectivePrice(
    payload.roomId,
    payload.checkIn,
    payload.checkOut
  );

  const booking = await prisma.booking.create({
    data: { ...payload, userId, totalPrice, status: 'PENDING' },
  });

  await prisma.roomAvailability.updateMany({
    where: { roomId: payload.roomId, date: { gte: payload.checkIn, lt: payload.checkOut } },
    data: { isBooked: true },
  });

  return booking;
};

const getMyBookings = async (userId: string): Promise<Booking[]> =>
  prisma.booking.findMany({
    where: { userId },
    include: { room: true },
    orderBy: { createdAt: 'desc' },
  });

const getBookingById = async (id: string, userId: string, role: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: { include: { hotel: true } } },
  });
  if (!booking) throw new ApiError(`Booking '${id}' not found.`, StatusCodes.NOT_FOUND);

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
  if (!booking) throw new ApiError(`Booking '${id}' not found.`, StatusCodes.NOT_FOUND);
  if (booking.userId !== userId) {
    throw new ApiError('You are not authorized to cancel this booking.', StatusCodes.FORBIDDEN);
  }

  const dates = datesBetween(new Date(booking.checkIn), new Date(booking.checkOut));
  await releaseBookingLocks(booking.roomId, dates);
  await prisma.roomAvailability.updateMany({
    where: { roomId: booking.roomId, date: { gte: booking.checkIn, lt: booking.checkOut } },
    data: { isBooked: false },
  });

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });

  const payment = await prisma.payment.findUnique({ where: { bookingId: id } });
  if (payment && payment.status === 'PAID') {
    await refundQueue.add('refund', { paymentId: payment.id });
  }
  return updated;
};

const getOwnerBookings = async (userId: string): Promise<Booking[]> =>
  prisma.booking.findMany({
    where: { room: { hotel: { ownerId: userId } } },
    include: { room: true, user: true },
    orderBy: { createdAt: 'desc' },
  });

const checkInBooking = async (id: string, userId: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: { include: { hotel: true } } },
  });
  if (!booking) throw new ApiError(`Booking '${id}' not found.`, StatusCodes.NOT_FOUND);
  if (booking.room?.hotel?.ownerId !== userId) {
    throw new ApiError('You are not authorized to check in this booking.', StatusCodes.FORBIDDEN);
  }
  if (booking.status !== 'CONFIRMED') {
    throw new ApiError('Only confirmed bookings can be checked in.', StatusCodes.BAD_REQUEST);
  }
  return prisma.booking.update({ where: { id }, data: { status: 'CHECKED_IN' } });
};

const checkOutBooking = async (id: string, userId: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: { include: { hotel: true } } },
  });
  if (!booking) throw new ApiError(`Booking '${id}' not found.`, StatusCodes.NOT_FOUND);
  if (booking.room?.hotel?.ownerId !== userId) {
    throw new ApiError('You are not authorized to check out this booking.', StatusCodes.FORBIDDEN);
  }
  return prisma.booking.update({ where: { id }, data: { status: 'CHECKED_OUT' } });
};

const walkInCreate = async (payload: {
  roomId: string;
  checkIn: Date | string;
  checkOut: Date | string;
  guests: number;
  staffId: string;
  userId: string;
}): Promise<Booking> => {
  const room = await prisma.room.findUnique({ where: { id: payload.roomId } });
  if (!room) throw new ApiError(`Room '${payload.roomId}' not found.`, StatusCodes.NOT_FOUND);

  const dates = datesBetween(new Date(payload.checkIn), new Date(payload.checkOut));
  const locked = await acquireBookingLocks(payload.roomId, dates);
  if (!locked) {
    throw new ApiError('Room is not available for the selected dates', StatusCodes.CONFLICT);
  }

  const booking = await prisma.booking.create({
    data: {
      roomId: payload.roomId,
      userId: payload.userId,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      guests: payload.guests,
      totalPrice: await PricingRuleService.calculateEffectivePrice(
        payload.roomId,
        payload.checkIn,
        payload.checkOut
      ),
      status: 'CONFIRMED',
      source: 'WALK_IN',
    },
  });

  await prisma.roomAvailability.updateMany({
    where: { roomId: payload.roomId, date: { gte: payload.checkIn, lt: payload.checkOut } },
    data: { isBooked: true },
  });
  return booking;
};

export const BookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings,
  checkInBooking,
  checkOutBooking,
  walkInCreate,
};
