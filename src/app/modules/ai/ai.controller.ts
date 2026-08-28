import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AIService } from './ai.service';
import { catchAsync } from '../../../shared/async.handler';
import { sendResponse } from '../../../shared/response.helper';
import { validateRequest } from '../../../middlewares/validateRequest';
import { AIValidation } from './ai.validation';

const chat = catchAsync(async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  await AIService.chatStream(req.body.message, (token: string) => {
    res.write(`data: ${JSON.stringify({ token })}\n\n`);
  });
  res.write('data: [DONE]\n\n');
  res.end();
});

const searchParse = catchAsync(async (req: Request, res: Response) => {
  const result = await AIService.searchParse(req.body.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Filters parsed',
    data: result,
  });
});

const recommendations = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const result = await AIService.recommendations(req.user!.userId, limit);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Recommendations fetched',
    data: result,
  });
});

export const AIController = { chat, searchParse, recommendations };
