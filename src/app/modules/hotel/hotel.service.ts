import prisma from '../../../shared/prisma';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/ApiError';
import { handlePrismaError } from '../../../shared/prismaError';
import { Prisma, Hotel } from '@prisma/client';

const getAllHotels = async (query: {
  searchTerm?: string;
  location?: string;
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

  if (query.location) {
    where.location = query.location;
  }

  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.hotel.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.hotel.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const getHotelBySlug = async (slug: string): Promise<Hotel> => {
  const result = await prisma.hotel.findUnique({ where: { slug } });

  if (!result) {
    throw new ApiError(`Hotel with slug '${slug}' is not found.`, StatusCodes.NOT_FOUND);
  }

  return result;
};

const createHotel = async (payload: Prisma.HotelUncheckedCreateInput): Promise<Hotel> => {
  try {
    return await prisma.hotel.create({ data: payload });
  } catch (error) {
    throw handlePrismaError(error);
  }
};

const updateHotel = async (
  id: string,
  payload: Prisma.HotelUncheckedUpdateInput
): Promise<Hotel> => {
  const existingHotel = await prisma.hotel.findUnique({ where: { id } });

  if (!existingHotel) {
    throw new ApiError(`Hotel with ID '${id}' is not found.`, StatusCodes.NOT_FOUND);
  }
  return prisma.hotel.update({ where: { id }, data: payload });
};

const deleteHotel = async (id: string): Promise<Hotel> => {
  const existingHotel = await prisma.hotel.findUnique({ where: { id } });

  if (!existingHotel) {
    throw new ApiError(`Hotel with ID '${id}' is not found.`, StatusCodes.NOT_FOUND);
  }

  return prisma.hotel.delete({ where: { id } });
};

const approveHotel = async (id: string): Promise<Hotel> => {
  const existingHotel = await prisma.hotel.findUnique({ where: { id } });

  if (!existingHotel) {
    throw new ApiError(`Hotel with ID '${id}' is not found.`, StatusCodes.NOT_FOUND);
  }

  return prisma.hotel.update({
    where: { id },
    data: { status: 'APPROVED' },
  });
};

export const HotelService = {
  getAllHotels,
  getHotelBySlug,
  createHotel,
  updateHotel,
  deleteHotel,
  approveHotel,
};
