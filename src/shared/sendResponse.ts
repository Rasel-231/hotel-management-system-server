import { Response } from 'express';

interface ISendResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export const sendResponse = <T>(res: Response, payload: ISendResponse<T>) => {
  const { statusCode, success, message, data, meta } = payload;
  res.status(statusCode).json({ success, message, meta, data });
};
