import { Role } from '@prisma/client';

export type IUserCreateInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
  address?: string;
};

export type IUserUpdateInput = {
  name?: string;
  phone?: string;
  address?: string;
};

export type IUserAdminUpdateInput = {
  name?: string;
  phone?: string;
  address?: string;
  role?: Role;
  isVerified?: boolean;
};
