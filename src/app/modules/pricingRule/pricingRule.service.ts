import { Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma.client';
import { buildWhere } from '../../../shared/pagination.helper';
import { TPricingRuleCreate, TPricingRuleUpdate } from './pricingRule.interface';
import { datesBetween } from '../../../shared/booking.lock';

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

const listByHotel = async (hotelId: string) =>
  prisma.pricingRule.findMany({ where: { hotelId }, orderBy: { startDate: 'asc' } });

const calculateEffectivePrice = async (
  roomId: string,
  checkIn: string | Date,
  checkOut: string | Date
): Promise<number> => {
  const room = await prisma.room.findUniqueOrThrow({
    where: { id: roomId },
    include: { pricingRules: true },
  });

  const nights = datesBetween(new Date(checkIn), new Date(checkOut));
  const base = room.basePrice ?? room.price;
  let total = 0;

  for (const d of nights) {
    const date = new Date(d);
    let nightly = base;
    const active = room.pricingRules.filter(
      (r) => r.startDate <= date && r.endDate >= date
    );
    for (const rule of active) {
      if (rule.type === 'WEEKEND' && (date.getDay() === 0 || date.getDay() === 6)) {
        nightly *= rule.modifier;
      } else if (rule.type === 'SEASONAL' || rule.type === 'EARLY_BIRD') {
        nightly *= rule.modifier;
      }
    }
    total += nightly;
  }

  const lengthOfStay = room.pricingRules.find((r) => r.type === 'LENGTH_OF_STAY');
  if (lengthOfStay && nights.length >= 7) {
    total *= lengthOfStay.modifier;
  }

  return Math.round(total * 100) / 100;
};

export const PricingRuleService = {
  getAll,
  getById,
  create,
  update,
  remove,
  listByHotel,
  calculateEffectivePrice,
};
