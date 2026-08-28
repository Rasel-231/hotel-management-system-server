import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from '../shared/jwtHelpers';
import { MulterError } from 'multer';
import ApiError from '../shared/ApiError';

type ErrorSource = { path: string | number; message: string }[];

export const globalErrorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errorSources: ErrorSource = [{ path: '', message: 'Something went wrong' }];

  // 1. Custom API error
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorSources = [{ path: '', message: error.message }];

  // 2. Zod validation error
  } else if (error instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation Error';
    errorSources = error.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    }));

  // 3. Prisma known request errors (unique, FK, not found etc.)
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        statusCode = StatusCodes.CONFLICT;
        const meta = error.meta as { target?: string | string[] } | undefined;
        const target = meta?.target
          ? Array.isArray(meta.target)
            ? meta.target.join(', ')
            : meta.target
          : 'field';
        message = `Duplicate value for ${target}`;
        errorSources = [{ path: target, message: `${target} already exists` }];
        break;
      }
      case 'P2025':
        statusCode = StatusCodes.NOT_FOUND;
        message = 'Requested record not found';
        errorSources = [{ path: '', message }];
        break;
      case 'P2003':
        statusCode = StatusCodes.BAD_REQUEST;
        message = 'Invalid reference (foreign key constraint failed)';
        errorSources = [{ path: '', message }];
        break;
      default:
        statusCode = StatusCodes.BAD_REQUEST;
        message = 'Database request error';
        errorSources = [{ path: '', message: error.message }];
        break;
    }

  // 4. Prisma validation error (wrong field type/name in query)
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid data passed to database query';
    errorSources = [{ path: '', message }];

  // 5. JWT errors
  } else if (error instanceof TokenExpiredError) {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Token expired, please login again';
    errorSources = [{ path: '', message }];
  } else if (error instanceof JsonWebTokenError) {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid token';
    errorSources = [{ path: '', message }];

  // 6. Multer (file upload) errors
  } else if (error instanceof MulterError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = error.message;
    errorSources = [{ path: error.field ?? '', message: error.message }];

  // 7. Malformed JSON body
  } else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid JSON payload';
    errorSources = [{ path: '', message }];

  // 8. Generic JS error (fallback)
  } else if (error instanceof Error) {
    message = error.message;
    errorSources = [{ path: '', message: error.message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack:
      process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.stack
        : undefined,
  });

  // Optional: production logging (Winston/Sentry etc.)
  if (process.env.NODE_ENV === 'production' && statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
    // logger.error(message, { url: req.originalUrl, method: req.method, error });
  }
};
