import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HotelPolicyService } from './hotelPolicy.service';
import { catchAsync } from '../../../shared/async.handler';
import { sendResponse } from '../../../shared/response.helper';

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelPolicyService.getAll(req.query as Record<string, unknown>);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel policies retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelPolicyService.getById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel policy retrieved successfully',
    data: result,
  });
});

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelPolicyService.create(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Hotel policy created successfully',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelPolicyService.update(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel policy updated successfully',
    data: result,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await HotelPolicyService.remove(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Hotel policy deleted successfully',
    data: result,
  });
});

export const HotelPolicyController = { getAll, getById, create, update, remove };
