import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { HotelService } from './hotel.service';
import { hotelCreateFields, hotelUpdateFields } from './hotel.constant';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import { pick } from '../../../shared/pick';

const getAllHotels = catchAsync(async (req: Request, res: Response) => {
  const queryData = req.query as {
    searchTerm?: string;
    location?: string;
    page?: string | number;
    limit?: string | number;
  }
  const result = await HotelService.getAllHotels(queryData);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotels fetched successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getHotelBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.getHotelBySlug(req.params.slug);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel fetched successfully',
    data: result,
  });
});

const createHotel = catchAsync(async (req: Request, res: Response) => {
  const data = pick(req.body as Record<string, unknown>, hotelCreateFields);
  const result = await HotelService.createHotel({
    ...data,
    ownerId: req.user!.userId,
  } as Prisma.HotelUncheckedCreateInput);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Hotel created successfully',
    data: result,
  });
});

const updateHotel = catchAsync(async (req: Request, res: Response) => {
  const data = pick(req.body as Record<string, unknown>, hotelUpdateFields);
  const result = await HotelService.updateHotel(
    req.params.id,
    data as Prisma.HotelUncheckedUpdateInput
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel updated successfully',
    data: result,
  });
});

const deleteHotel = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.deleteHotel(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel removed successfully',
    data: result,
  });
});

const approveHotel = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelService.approveHotel(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel approved successfully',
    data: result,
  });
});

export const HotelController = {
  getAllHotels,
  getHotelBySlug,
  createHotel,
  updateHotel,
  deleteHotel,
  approveHotel,
};
