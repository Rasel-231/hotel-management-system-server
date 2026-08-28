import prisma from '../../../shared/prisma.client';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../shared/api.error';
import { handlePrismaError } from '../../../shared/prisma.error';
import { Prisma, Review } from '@prisma/client';

const getReviewsByHotel = async (hotelId: string) => {
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });

  if (!hotel) {
    throw new ApiError(`Hotel with ID '${hotelId}' is not found.`, StatusCodes.NOT_FOUND);
  }

  return prisma.review.findMany({
    where: { hotelId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
};

const createReview = async (
  payload: Prisma.ReviewUncheckedCreateInput,
  userId: string
): Promise<Review> => {
  const booking = await prisma.booking.findUnique({ where: { id: payload.bookingId } });

  if (!booking) {
    throw new ApiError(`Booking with ID '${payload.bookingId}' is not found.`, StatusCodes.NOT_FOUND);
  }

  if (booking.userId !== userId) {
    throw new ApiError('You can only review a hotel for your own booking.', StatusCodes.FORBIDDEN);
  }

  try {
    return await prisma.review.create({ data: { ...payload, userId } });
  } catch (error) {
    throw handlePrismaError(error, 'A review for this booking already exists.');
  }
};

const deleteReview = async (id: string): Promise<Review> => {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    throw new ApiError(`Review with ID '${id}' is not found.`, StatusCodes.NOT_FOUND);
  }

  return prisma.review.delete({ where: { id } });
};

export const ReviewService = {
  getReviewsByHotel,
  createReview,
  deleteReview,
};
