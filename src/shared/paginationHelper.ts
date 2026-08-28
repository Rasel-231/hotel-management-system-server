export type IOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type IOptionsResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export const paginationFields = ['page', 'limit', 'sortBy', 'sortOrder'];

export const calculatePagination = (options: IOptions): IOptionsResult => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = (options.sortOrder || 'desc') as 'asc' | 'desc';

  return { page, limit, skip, sortBy, sortOrder };
};

export const pick = <T extends Record<string, unknown>>(
  obj: T,
  keys: string[]
): Partial<T> => {
  const result: Partial<T> = {};
  keys.forEach((key) => {
    if (obj[key] !== undefined) {
      (result as Record<string, unknown>)[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T extends Record<string, unknown>>(
  obj: T,
  keys: string[]
): Partial<T> => {
  const result: Partial<T> = { ...obj };
  keys.forEach((key) => delete (result as Record<string, unknown>)[key]);
  return result;
};

export const buildWhere = <TWhere = Record<string, unknown>>(params: {
  query: Record<string, unknown>;
  searchableFields?: string[];
  extraConditions?: TWhere;
}): {
  where: TWhere;
  orderBy: Record<string, string>;
  skip: number;
  take: number;
  page: number;
  limit: number;
} => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination({
    page: params.query.page as number | undefined,
    limit: params.query.limit as number | undefined,
    sortBy: params.query.sortBy as string | undefined,
    sortOrder: params.query.sortOrder as 'asc' | 'desc' | undefined,
  });

  const searchTerm = params.query.searchTerm as string | undefined;
  const filters = omit(params.query, [...paginationFields, 'searchTerm']);

  const andConditions: Record<string, unknown>[] = [];

  if (searchTerm && params.searchableFields?.length) {
    andConditions.push({
      OR: params.searchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (Object.keys(filters).length) {
    andConditions.push({
      AND: Object.entries(filters).map(([key, value]) => ({ [key]: value })),
    });
  }

  if (params.extraConditions) {
    andConditions.push(params.extraConditions as Record<string, unknown>);
  }

  const where = andConditions.length
    ? ({ AND: andConditions } as TWhere)
    : ({} as TWhere);
  const orderBy: Record<string, string> = sortBy
    ? { [sortBy]: sortOrder }
    : { createdAt: 'desc' };

  return { where, orderBy, skip, take: limit, page, limit };
};

export const paginationHelpers = {
  calculatePagination,
  paginationFields,
  pick,
  omit,
  buildWhere,
};
