import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { RoomService } from './room.service';
import { roomCreateFields, roomUpdateFields } from './room.constant';
import { catchAsync } from '../../../shared/async.handler';
import { sendResponse } from '../../../shared/response.helper';
import { pick } from '../../../shared/object.util';

const getRoomsByHotel = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.getRoomsByHotel(req.params.hotelId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rooms fetched successfully',
    data: result,
  });
});

const getRoomAvailability = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.getRoomAvailability(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Room availability fetched successfully',
    data: result,
  });
});

const createRoom = catchAsync(async (req: Request, res: Response) => {
  const data = pick(req.body as Record<string, unknown>, roomCreateFields);
  const result = await RoomService.createRoom(
    data as Prisma.RoomUncheckedCreateInput,
    req.user!.userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Room created successfully',
    data: result,
  });
});

const updateRoom = catchAsync(async (req: Request, res: Response) => {
  const data = pick(req.body as Record<string, unknown>, roomUpdateFields);
  const result = await RoomService.updateRoom(
    req.params.id,
    data as Prisma.RoomUncheckedUpdateInput,
    req.user!.userId
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Room updated successfully',
    data: result,
  });
});

const blockDates = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.blockDates(req.params.id, req.user!.userId, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Dates blocked', data: result });
});

const unblockDates = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.unblockDates(req.params.id, req.user!.userId, req.body);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Dates unblocked', data: result });
});

export const RoomController = {
  getRoomsByHotel,
  getRoomAvailability,
  createRoom,
  updateRoom,
  blockDates,
  unblockDates,
};
