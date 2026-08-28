
import { User } from '@prisma/client';
import { IUserResponse } from '../app/modules/auth/auth.interface';
import { jwtHelpers } from '../shared/jwt.helper';
import config from '../config';

export const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export const toUserResponse = (user: User): IUserResponse => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isVerified: user.isVerified,
});

export const generateTokens = async (payload: {
    userId: string;
    role: string;
    tokenVersion: number;
}): Promise<{ accessToken: string; refreshToken: string }> => {
    const accessToken = jwtHelpers.createToken(
        { userId: payload.userId, role: payload.role, tokenVersion: payload.tokenVersion },
        config.jwt.secret,
        config.jwt.expires_in
    );
    const refreshToken = jwtHelpers.createToken(
        { userId: payload.userId, role: payload.role, tokenVersion: payload.tokenVersion },
        config.jwt.secret,
        config.jwt.refresh_expires_in
    );

    return { accessToken, refreshToken };
};
