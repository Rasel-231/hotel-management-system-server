import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.service';
import { catchAsync } from '../../../shared/async.handler';
import { sendResponse } from '../../../shared/response.helper';
import { validateRequest } from '../../../middlewares/validateRequest';
import { NotificationValidation } from './notification.validation';

const list = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.list(req.user!.userId, req.query as Record<string, unknown>);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications fetched',
    meta: result.meta,
    data: result.data,
  });
});

const markRead = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.markRead(req.params.id, req.user!.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

export const NotificationController = { list, markRead };
