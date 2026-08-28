import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RoomHousekeepingService } from './roomHousekeeping.service';
import { catchAsync } from '../../../shared/async.handler';
import { sendResponse } from '../../../shared/response.helper';

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomHousekeepingService.getAll(req.query as Record<string, unknown>);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Room housekeeping records retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomHousekeepingService.getById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Room housekeeping record retrieved successfully',
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomHousekeepingService.create(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Room housekeeping record created successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomHousekeepingService.update(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Room housekeeping record updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomHousekeepingService.remove(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Room housekeeping record deleted successfully',
    data: result,
  });
});

const setStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomHousekeepingService.setStatus(
    req.params.id,
    req.user!.userId,
    req.body.status,
    req.body.assignedStaffId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Housekeeping status updated',
    data: result,
  });
});

export const RoomHousekeepingController = { getAll, getById, create, update, remove, setStatus };
