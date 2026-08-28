import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { ParsedFilters } from '../ai/ai.interface';
import { haversineKm } from '../../../shared/geo';

export interface SearchParams extends Partial<ParsedFilters> {
  q?: string;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

export const searchHotels = async (filters: SearchParams) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Prisma.HotelWhereInput = { status: 'ACTIVE' };

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: 'insensitive' } },
      { location: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
  if (filters.rating) where.reviews = { some: { rating: { gte: filters.rating } } };

  const roomWhere: Prisma.RoomWhereInput = {};
  if (filters.guests) roomWhere.capacity = { gte: filters.guests };
  if (filters.priceMax) roomWhere.price = { lte: filters.priceMax };
  if (filters.amenities?.length) roomWhere.amenities = { hasEvery: filters.amenities };

  if (filters.checkIn && filters.checkOut) {
    roomWhere.availabilities = {
      none: {
        isBooked: true,
        date: { gte: new Date(filters.checkIn), lt: new Date(filters.checkOut) },
      },
    };
  }

  if (Object.keys(roomWhere).length) {
    where.rooms = { some: roomWhere };
  }

  const [rows, total] = await prisma.$transaction([
    prisma.hotel.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.hotel.count({ where }),
  ]);

  let data = rows;
  if (filters.lat !== undefined && filters.lng !== undefined) {
    const radius = filters.radius ?? 20;
    data = rows.filter((h) => {
      if (h.latitude == null || h.longitude == null) return false;
      return haversineKm(filters.lat!, filters.lng!, h.latitude, h.longitude) <= radius;
    });
  }

  return { data, meta: { page, limit, total: filters.lat !== undefined ? data.length : total } };
};
