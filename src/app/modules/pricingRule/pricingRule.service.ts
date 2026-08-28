import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { buildWhere } from '../../../shared/paginationHelper';
import { TPricingRuleCreate, TPricingRuleUpdate } from './pricingRule.interface';

const getAll = async (query: Record<string, unknown>) => {
  const { where, orderBy, skip, take, page, limit } = buildWhere({
    query,
    searchableFields: [],
  });

  const [data, total] = await prisma.$transaction([
    prisma.pricingRule.findMany({
      where: where as Prisma.PricingRuleWhereInput,
      orderBy: orderBy as Prisma.PricingRuleOrderByWithRelationInput,
      skip,
      take,
    }),
    prisma.pricingRule.count({ where: where as Prisma.PricingRuleWhereInput }),
  ]);

  return { meta: { page, limit, total }, data };
};

const getById = async (id: string) => {
  return prisma.pricingRule.findUniqueOrThrow({ where: { id } });
};

const create = async (payload: TPricingRuleCreate) => {
  return prisma.pricingRule.create({ data: payload });
};

const update = async (id: string, payload: TPricingRuleUpdate) => {
  await prisma.pricingRule.findUniqueOrThrow({ where: { id } });
  return prisma.pricingRule.update({ where: { id }, data: payload });
};

const remove = async (id: string) => {
  await prisma.pricingRule.findUniqueOrThrow({ where: { id } });
  return prisma.pricingRule.delete({ where: { id } });
};

export const PricingRuleService = { getAll, getById, create, update, remove };
