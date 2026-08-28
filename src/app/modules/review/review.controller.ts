import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { ReviewService } from './review.service';
import { reviewCreateFields } from './review.constant';
import { catchAsync } from '../../../shared/async.handler';
import { sendResponse } from '../../../shared/response.helper';
import { pick } from '../../../shared/object.util';

const getReviewsByHotel = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getReviewsByHotel(req.params.hotelId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reviews fetched successfully',
    data: result,
  });
});

const createReview = catchAsync(async (req: Request, res: Response) => {
  const data = pick(req.body as Record<string, unknown>, reviewCreateFields);
  const result = await ReviewService.createReview(
    data as Prisma.ReviewUncheckedCreateInput,
    req.user!.userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.deleteReview(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review deleted successfully',
    data: result,
  });
});

export const ReviewController = {
  getReviewsByHotel,
  createReview,
  deleteReview,
};
