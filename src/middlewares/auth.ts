import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../shared/ApiError';
import { jwtHelpers, DecodedToken } from '../shared/jwtHelpers';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export const auth = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new ApiError('You are not authorized', StatusCodes.UNAUTHORIZED);
      }
      const decoded = jwtHelpers.verifyToken(token, config.jwt.secret);
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        throw new ApiError('Forbidden: insufficient permissions', StatusCodes.FORBIDDEN);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
