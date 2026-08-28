import { Prisma, Role } from '@prisma/client';

export type IUserRole = Role;

export type IUserResponse = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    role: true;
    phone: true;
    isVerified: true;
  };
}>;

export type IRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
};

export type ILoginPayload = {
  email: string;
  password: string;
};

export type ITokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type IAuthResult = ITokenPair & {
  user: IUserResponse;
};

export type IVerifyOtpPayload = {
  email: string;
  otp: string;
};

export type IForgotPasswordPayload = {
  email: string;
};

export type IResetPasswordPayload = {
  token: string;
  newPassword: string;
};

export type ILogoutResponse = {
  message: string;
};
