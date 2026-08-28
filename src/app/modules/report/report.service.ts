import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma.client';

interface ReportQuery {
  hotelId?: string;
  startDate?: string;
  endDate?: string;
}

const ownedHotelIds = async (userId: string, hotelId?: string): Promise<string[]> => {
  const hotels = await prisma.hotel.findMany({
    where: { ownerId: userId, ...(hotelId ? { id: hotelId } : {}) },
    select: { id: true },
  });
  return hotels.map((h) => h.id);
};

const rangeNights = (start: Date, end: Date): number => {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

export const revenue = async (userId: string, query: ReportQuery) => {
  const hotelIds = await ownedHotelIds(userId, query.hotelId);
  if (!hotelIds.length) return { totalRevenue: 0, paymentCount: 0, currency: 'BDT' };

  const dateFilter: Prisma.DateTimeFilter = {};
  if (query.startDate) dateFilter.gte = new Date(query.startDate);
  if (query.endDate) dateFilter.lte = new Date(query.endDate);

  const where: Prisma.PaymentWhereInput = {
    status: 'PAID',
    booking: { room: { hotelId: { in: hotelIds } } },
    ...(query.startDate || query.endDate ? { createdAt: dateFilter } : {}),
  };

  const agg = await prisma.payment.aggregate({
    where,
    _sum: { amount: true },
    _count: { _all: true },
  });

  return {
    totalRevenue: agg._sum.amount ?? 0,
    paymentCount: agg._count._all,
    currency: 'BDT',
  };
};

export const occupancy = async (userId: string, query: ReportQuery) => {
  const hotelIds = await ownedHotelIds(userId, query.hotelId);
  if (!hotelIds.length) {
    return { occupancyRate: 0, adr: 0, revpar: 0, bookedNights: 0, totalRoomNights: 0 };
  }

  const start = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 86400000);
  const end = query.endDate ? new Date(query.endDate) : new Date();
  const nights = rangeNights(start, end);

  const rooms = await prisma.room.findMany({
    where: { hotelId: { in: hotelIds } },
    select: { id: true, quantity: true, price: true },
  });
  const roomIds = rooms.map((r) => r.id);
  const totalRoomNights = rooms.reduce((sum, r) => sum + (r.quantity ?? 1) * nights, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      roomId: { in: roomIds },
      status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
      checkIn: { lte: end },
      checkOut: { gte: start },
    },
    select: { id: true, totalPrice: true, checkIn: true, checkOut: true },
  });

  const bookedNights = bookings.reduce((sum, b) => {
    const ci = new Date(b.checkIn) < start ? start : new Date(b.checkIn);
    const co = new Date(b.checkOut) > end ? end : new Date(b.checkOut);
    return sum + Math.max(0, rangeNights(ci, co));
  }, 0);

  const revenueAgg = await prisma.payment.aggregate({
    where: { status: 'PAID', bookingId: { in: bookings.map((b) => b.id) } },
    _sum: { amount: true },
  });
  const revenueTotal = revenueAgg._sum.amount ?? 0;

  return {
    occupancyRate: totalRoomNights ? bookedNights / totalRoomNights : 0,
    adr: bookings.length ? revenueTotal / bookings.length : 0,
    revpar: totalRoomNights ? revenueTotal / totalRoomNights : 0,
    bookedNights,
    totalRoomNights,
  };
};

export const ReportService = { revenue, occupancy };
