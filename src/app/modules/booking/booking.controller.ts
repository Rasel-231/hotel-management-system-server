import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { BookingService } from './booking.service';
import { bookingCreateFields } from './booking.constant';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import { pick } from '../../../shared/pick';

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const data = pick(req.body as Record<string, unknown>, bookingCreateFields);
  const result = await BookingService.createBooking(
    data as Prisma.BookingUncheckedCreateInput,
    req.user!.userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getMyBookings(req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'My bookings fetched successfully',
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getBookingById(
    req.params.id,
    req.user!.userId,
    req.user!.role
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking fetched successfully',
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.cancelBooking(req.params.id, req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking cancelled successfully',
    data: result,
  });
});

const getOwnerBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getOwnerBookings(req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Owner bookings fetched successfully',
    data: result,
  });
});

const checkInBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.checkInBooking(req.params.id, req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking checked in successfully',
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings,
  checkInBooking,
};
