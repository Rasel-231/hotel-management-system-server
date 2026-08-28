import jwt, { Secret, SignOptions } from 'jsonwebtoken';

export type DecodedToken = {
  userId: string;
  role: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
};

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expireTime: string
): string => {
  return jwt.sign(payload, secret, {
    expiresIn: expireTime as SignOptions['expiresIn'],
  });
};

const verifyToken = (token: string, secret: Secret): DecodedToken => {
  return jwt.verify(token, secret) as DecodedToken;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};

export { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
