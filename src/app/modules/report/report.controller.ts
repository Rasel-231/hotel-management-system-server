import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ReportService } from './report.service';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import { validateRequest } from '../../../middlewares/validateRequest';
import { ReportValidation } from './report.validation';

const revenue = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.revenue(req.user!.userId, req.query as Record<string, string>);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Revenue report', data: result });
});

const occupancy = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.occupancy(req.user!.userId, req.query as Record<string, string>);
  sendResponse(res, { statusCode: StatusCodes.OK, success: true, message: 'Occupancy report', data: result });
});

export const ReportController = { revenue, occupancy };
