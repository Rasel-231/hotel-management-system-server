import prisma from '../../../shared/prisma.client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/api.error';
import {
  Prisma,
  Booking,
  BookingStatus,
  BookedFor,
  Role,
  SubRole,
  IdType,
  VisitPurpose,
} from '@prisma/client';
import { acquireBookingLocks, releaseBookingLocks, datesBetween } from '../../../shared/booking.lock';
import { scheduleBookingExpiry, cancelBookingExpiry } from '../../../shared/booking.expiry';
import { refundQueue } from '../../../shared/queue.manager';
import { PricingRuleService } from '../pricingRule/pricingRule.service';
import { notify } from '../../../shared/notification.helper';
import { emitToHotel, SOCKET_EVENTS } from '../../../shared/socket.server';
import bcrypt from 'bcrypt';
import config from '../../../config';

export type TCreateBookingPayload = {
  roomId: string;
  checkIn: string | Date;
  checkOut: string | Date;
  guests?: number;
  adults?: number;
  children?: number;
  roomsCount?: number;
  specialRequests?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestIdType?: IdType;
  guestIdNumber?: string;
  guestAddress?: string;
  guestPurpose?: VisitPurpose;
  password?: string;
  source?: string;
};

const HOLDS_ROLE: SubRole[] = [SubRole.MANAGER, SubRole.FRONT_DESK];

const scheduleExpiry = async (bookingId: string): Promise<void> => {
  try {
    await scheduleBookingExpiry(bookingId);
  } catch (err) {
    // Non-fatal; the periodic sweeper reclaims stale PENDING bookings.
    console.error('Failed to schedule booking expiry', err);
  }
};

const releaseBookingResources = async (
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<void> => {
  await releaseBookingLocks(roomId, datesBetween(checkIn, checkOut));
  await prisma.roomAvailability.updateMany({
    where: { roomId, date: { gte: checkIn, lt: checkOut } },
    data: { isBooked: false },
  });
};

const createBooking = async (
  payload: TCreateBookingPayload,
  userId?: string
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

  if (!userId) {
    if (!payload.guestName || !payload.guestEmail || !payload.password) {
      throw new ApiError(
        'Guest name, email, and password are required for guest booking.',
        StatusCodes.BAD_REQUEST
      );
    }
  }

  const dates = datesBetween(checkIn, checkOut);
  const locked = await acquireBookingLocks(payload.roomId, dates);
  if (!locked) {
    throw new ApiError('Room is not available for the selected dates', StatusCodes.CONFLICT);
  }

  try {
    const totalPrice = await PricingRuleService.calculateEffectivePrice(
      payload.roomId,
      checkIn,
      checkOut
    );
    const expiresAt = new Date(Date.now() + config.booking.hold_minutes * 60 * 1000);

    const booking = await prisma.$transaction(async (tx) => {
      let resolvedUserId = userId;
      let bookedFor: BookedFor = BookedFor.SELF;

      if (!resolvedUserId) {
        const email = payload.guestEmail!.trim().toLowerCase();
        const passwordHash = await bcrypt.hash(payload.password!, config.salt_rounds);

        let guestUser;
        try {
          guestUser = await tx.user.create({
            data: {
              name: payload.guestName!.trim(),
              email,
              passwordHash,
              phone: payload.guestPhone,
              role: Role.GUEST,
            },
          });
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            // same email diye age theke account ache -> shei account-i use hobe
            guestUser = await tx.user.findUniqueOrThrow({ where: { email } });
          } else {
            throw err;
          }
        }

        resolvedUserId = guestUser.id;
        bookedFor = BookedFor.GUEST;
      }
      const { password, ...bookingData } = payload;

      const created = await tx.booking.create({
        data: {
          ...bookingData,
          hotelId: room.hotelId,
          checkIn,
          checkOut,
          userId: resolvedUserId,
          bookedFor,
          totalPrice,
          status: BookingStatus.PENDING,
          source: payload.source ?? 'ONLINE',
          expiresAt,
        },
      });

      await tx.roomAvailability.updateMany({
        where: { roomId: payload.roomId, date: { gte: checkIn, lt: checkOut } },
        data: { isBooked: true },
      });

      return created;
    });

    await scheduleExpiry(booking.id);
    emitToHotel(room.hotelId, SOCKET_EVENTS.BOOKING_PENDING, { bookingId: booking.id });

    return booking;
  } catch (error) {
    await releaseBookingLocks(payload.roomId, dates);
    throw error;
  }
};

const expireBooking = async (bookingId: string): Promise<void> => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== BookingStatus.PENDING) return;

  const [, upd] = await prisma.$transaction([
    prisma.roomAvailability.updateMany({
      where: {
        roomId: booking.roomId,
        date: { gte: booking.checkIn, lt: booking.checkOut },
      },
      data: { isBooked: false },
    }),
    prisma.booking.updateMany({
      where: { id: bookingId, status: BookingStatus.PENDING },
      data: { status: BookingStatus.EXPIRED },
    }),
  ]);

  await releaseBookingLocks(
    booking.roomId,
    datesBetween(new Date(booking.checkIn), new Date(booking.checkOut))
  );

  if (upd.count > 0) {
    emitToHotel(booking.hotelId, SOCKET_EVENTS.BOOKING_RELEASED, { bookingId: booking.id });
    await notify(booking.userId, 'BOOKING_EXPIRED', { bookingId: booking.id }).catch(() => undefined);
  }
};

const sweepExpiredBookings = async (): Promise<number> => {
  const stale = await prisma.booking.findMany({
    where: { status: BookingStatus.PENDING, expiresAt: { lte: new Date() } },
    select: { id: true },
  });
  for (const booking of stale) {
    await expireBooking(booking.id);
  }
  return stale.length;
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

  const isAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;
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
  if (booking.status === BookingStatus.CHECKED_IN || booking.status === BookingStatus.CHECKED_OUT) {
    throw new ApiError('Cannot cancel a booking that has already been checked in or out.', StatusCodes.BAD_REQUEST);
  }
  if (booking.status === BookingStatus.EXPIRED) {
    throw new ApiError('Booking has already expired.', StatusCodes.BAD_REQUEST);
  }
  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError('Booking is already cancelled.', StatusCodes.BAD_REQUEST);
  }

  await cancelBookingExpiry(id);
  await releaseBookingResources(
    booking.roomId,
    new Date(booking.checkIn),
    new Date(booking.checkOut)
  );

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
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

const resolveHotelActor = async (userId: string, hotelId: string) => {
  const staff = await prisma.hotelStaff.findUnique({
    where: { hotelId_userId: { hotelId, userId } },
  });
  return staff;
};

const resolveHandledBy = async (
  booking: Booking,
  userId: string
): Promise<string | undefined> => {
  const isOwner = (await prisma.hotel.findUnique({
    where: { id: booking.hotelId },
    select: { ownerId: true },
  }))?.ownerId === userId;

  if (isOwner) return undefined;

  const staff = await resolveHotelActor(userId, booking.hotelId);
  if (!staff || !HOLDS_ROLE.includes(staff.subRole)) {
    throw new ApiError('You are not authorized to handle this booking.', StatusCodes.FORBIDDEN);
  }
  return staff.id;
};

const checkInBooking = async (id: string, userId: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: { include: { hotel: true } }, bookingCheckLogs: true },
  });
  if (!booking) throw new ApiError(`Booking '${id}' not found.`, StatusCodes.NOT_FOUND);

  const handledBy = await resolveHandledBy(booking, userId);

  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new ApiError('Only confirmed bookings can be checked in.', StatusCodes.BAD_REQUEST);
  }

  const checkInAt = new Date();
  const logData = handledBy ? { handledBy } : {};
  const [updatedBooking] = await prisma.$transaction([
    prisma.booking.update({ where: { id }, data: { status: BookingStatus.CHECKED_IN } }),
    booking.bookingCheckLogs[0]
      ? prisma.bookingCheckLog.update({
        where: { id: booking.bookingCheckLogs[0].id },
        data: { checkInAt, ...logData },
      })
      : prisma.bookingCheckLog.create({
        data: { bookingId: id, checkInAt, ...logData },
      }),
  ]);

  return updatedBooking;
};

const checkOutBooking = async (id: string, userId: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: { include: { hotel: true } }, bookingCheckLogs: true },
  });
  if (!booking) throw new ApiError(`Booking '${id}' not found.`, StatusCodes.NOT_FOUND);

  const handledBy = await resolveHandledBy(booking, userId);

  if (booking.status !== BookingStatus.CHECKED_IN) {
    throw new ApiError('Only checked-in bookings can be checked out.', StatusCodes.BAD_REQUEST);
  }

  const existingLog = booking.bookingCheckLogs[0];
  if (!existingLog || !existingLog.checkInAt) {
    throw new ApiError('No check-in record found for this booking.', StatusCodes.BAD_REQUEST);
  }

  const checkOutAt = new Date();
  const logData = handledBy ? { handledBy } : {};
  const [updatedBooking] = await prisma.$transaction([
    prisma.booking.update({ where: { id }, data: { status: BookingStatus.CHECKED_OUT } }),
    prisma.bookingCheckLog.update({
      where: { id: existingLog.id },
      data: { checkOutAt, ...logData },
    }),
  ]);

  return updatedBooking;
};

const walkInCreate = async (payload: {
  roomId: string;
  checkIn: Date | string;
  checkOut: Date | string;
  guests: number;
  userId: string;
}): Promise<Booking> => {
  const room = await prisma.room.findUnique({ where: { id: payload.roomId } });
  if (!room) throw new ApiError(`Room '${payload.roomId}' not found.`, StatusCodes.NOT_FOUND);

  const ownerId = (
    await prisma.hotel.findUnique({ where: { id: room.hotelId }, select: { ownerId: true } })
  )?.ownerId;
  if (ownerId !== payload.userId) {
    const staff = await prisma.hotelStaff.findUnique({
      where: { hotelId_userId: { hotelId: room.hotelId, userId: payload.userId } },
    });
    if (!staff || !HOLDS_ROLE.includes(staff.subRole)) {
      throw new ApiError('You are not authorized to create walk-in bookings for this hotel.', StatusCodes.FORBIDDEN);
    }
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

  try {
    const staff = ownerId === payload.userId
      ? null
      : await prisma.hotelStaff.findUnique({
          where: { hotelId_userId: { hotelId: room.hotelId, userId: payload.userId } },
        });

    const booking = await prisma.booking.create({
      data: {
        roomId: payload.roomId,
        userId: payload.userId,
        hotelId: room.hotelId,
        checkIn,
        checkOut,
        guests: payload.guests,
        totalPrice: await PricingRuleService.calculateEffectivePrice(
          payload.roomId,
          payload.checkIn,
          payload.checkOut
        ),
        status: BookingStatus.CONFIRMED,
        source: 'WALK_IN',
      },
    });

    await prisma.$transaction([
      prisma.roomAvailability.updateMany({
        where: { roomId: payload.roomId, date: { gte: checkIn, lt: checkOut } },
        data: { isBooked: true },
      }),
      prisma.bookingCheckLog.create({
        data: { bookingId: booking.id, handledBy: staff?.id },
      }),
    ]);

    emitToHotel(room.hotelId, SOCKET_EVENTS.NEW_BOOKING, { bookingId: booking.id });

    return booking;
  } catch (error) {
    await releaseBookingLocks(payload.roomId, dates);
    throw error;
  }
};

export const BookingService = {
  createBooking,
  expireBooking,
  sweepExpiredBookings,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings,
  checkInBooking,
  checkOutBooking,
  walkInCreate,
};