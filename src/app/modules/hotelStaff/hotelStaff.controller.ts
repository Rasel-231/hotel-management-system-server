import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HotelStaffService } from './hotelStaff.service';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelStaffService.getAll(req.query as Record<string, unknown>);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel staff retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelStaffService.getById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel staff member retrieved successfully',
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelStaffService.create(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Hotel staff member created successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelStaffService.update(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel staff member updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelStaffService.remove(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel staff member deleted successfully',
    data: result,
  });
});

const invite = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelStaffService.invite(req.params.hotelId, req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Staff invited successfully',
    data: result,
  });
});

const listByHotel = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelStaffService.listByHotel(req.params.hotelId, req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel staff retrieved successfully',
    data: result,
  });
});

const revoke = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelStaffService.revoke(req.params.staffId, req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Staff access revoked',
    data: result,
  });
});

export const HotelStaffController = { getAll, getById, create, update, remove, invite, listByHotel, revoke };
