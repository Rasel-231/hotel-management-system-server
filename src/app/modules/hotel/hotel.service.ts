import prisma from '../../../shared/prisma';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/ApiError';
import { Prisma, Hotel } from '@prisma/client';
import logger from '../../../utils/logger';

const assertOwner = async (hotelId: string, ownerId: string): Promise<Hotel> => {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) throw new ApiError(`Hotel '${hotelId}' not found.`, StatusCodes.NOT_FOUND);
  if (hotel.ownerId !== ownerId) {
    throw new ApiError('Forbidden: you do not own this hotel', StatusCodes.FORBIDDEN);
  }
  return hotel;
};

const getAllHotels = async (query: {
  searchTerm?: string;
  location?: string;
  ownerId?: string;
  page?: string | number;
  limit?: string | number;
}) => {
  const where: Prisma.HotelWhereInput = {};
  if (query.searchTerm) {
    where.OR = [
      { name: { contains: query.searchTerm, mode: 'insensitive' } },
      { location: { contains: query.searchTerm, mode: 'insensitive' } },
    ];
  }
  if (query.location) where.location = query.location;
  if (query.ownerId) where.ownerId = query.ownerId;

  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.hotel.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.hotel.count({ where }),
  ]);
  return { data, meta: { page, limit, total } };
};

const getHotelBySlug = async (slug: string): Promise<Hotel> => {
  const result = await prisma.hotel.findUnique({ where: { slug } });
  if (!result) throw new ApiError(`Hotel with slug '${slug}' is not found.`, StatusCodes.NOT_FOUND);
  return result;
};

const createHotel = async (
  payload: Prisma.HotelUncheckedCreateInput,
  ownerId: string
): Promise<Hotel> => {
  try {
    return await prisma.hotel.create({
      data: { ...payload, ownerId, slug: String(payload.slug).toLowerCase(), status: 'DRAFT' },
    });
  } catch (error) {
    logger.error('Hotel creation error', error);
    throw error;
  }
};

const updateHotel = async (id: string, ownerId: string, payload: Prisma.HotelUncheckedUpdateInput): Promise<Hotel> => {
  await assertOwner(id, ownerId);
  if (payload.slug) payload.slug = String(payload.slug).toLowerCase();
  return prisma.hotel.update({ where: { id }, data: payload });
};

const deleteHotel = async (id: string, ownerId: string): Promise<Hotel> => {
  await assertOwner(id, ownerId);
  return prisma.hotel.delete({ where: { id } });
};

const approveHotel = async (id: string): Promise<Hotel> => {
  const existing = await prisma.hotel.findUnique({ where: { id } });
  if (!existing) throw new ApiError(`Hotel '${id}' not found.`, StatusCodes.NOT_FOUND);
  return prisma.hotel.update({ where: { id }, data: { status: 'APPROVED' } });
};

const addImage = async (
  hotelId: string,
  ownerId: string,
  image: { url: string; publicId: string }
) => {
  await assertOwner(hotelId, ownerId);
  const count = await prisma.hotelImage.count({ where: { hotelId } });
  return prisma.hotelImage.create({
    data: {
      hotelId,
      url: image.url,
      publicId: image.publicId,
      isCover: count === 0,
      sortOrder: count,
    },
  });
};

const reorderImages = async (hotelId: string, ownerId: string, orderedIds: string[]) => {
  await assertOwner(hotelId, ownerId);
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.hotelImage.update({ where: { id }, data: { sortOrder: index } })
    )
  );
  return { reordered: true };
};

const setCover = async (hotelId: string, ownerId: string, imageId: string) => {
  await assertOwner(hotelId, ownerId);
  await prisma.hotelImage.updateMany({ where: { hotelId }, data: { isCover: false } });
  return prisma.hotelImage.update({ where: { id: imageId }, data: { isCover: true } });
};

const deleteImage = async (hotelId: string, ownerId: string, imageId: string) => {
  await assertOwner(hotelId, ownerId);
  return prisma.hotelImage.delete({ where: { id: imageId } });
};

const dashboard = async (hotelId: string, ownerId: string) => {
  await assertOwner(hotelId, ownerId);
  const [bookings, rooms, paidPayments] = await prisma.$transaction([
    prisma.booking.findMany({ where: { room: { hotelId } } }),
    prisma.room.findMany({ where: { hotelId } }),
    prisma.payment.findMany({ where: { status: 'PAID', booking: { room: { hotelId } } }, include: { booking: true } }),
  ]);

  const revenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT');
  const adr = confirmed.length ? revenue / confirmed.length : 0;

  return {
    totalBookings: bookings.length,
    confirmedBookings: confirmed.length,
    revenue,
    adr,
    roomCount: rooms.length,
  };
};

export const HotelService = {
  getAllHotels,
  getHotelBySlug,
  createHotel,
  updateHotel,
  deleteHotel,
  approveHotel,
  addImage,
  reorderImages,
  setCover,
  deleteImage,
  dashboard,
};
