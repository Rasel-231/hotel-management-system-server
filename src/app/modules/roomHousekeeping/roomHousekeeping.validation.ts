import { z } from 'zod';

const getAll = z.object({
  query: z
    .object({
      searchTerm: z.string().optional(),
      roomId: z.string().optional(),
      status: z.enum(['CLEAN', 'DIRTY', 'IN_PROGRESS', 'OOS']).optional(),
      assignedStaffId: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.string().optional(),
    })
    .optional(),
});

const create = z.object({
  body: z.object({
    roomId: z.string({ required_error: 'Room ID is required' }),
    status: z.enum(['CLEAN', 'DIRTY', 'IN_PROGRESS', 'OOS']).optional(),
    assignedStaffId: z.string().optional(),
  }),
});

const update = z.object({
  body: z.object({
    roomId: z.string().optional(),
    status: z.enum(['CLEAN', 'DIRTY', 'IN_PROGRESS', 'OOS']).optional(),
    assignedStaffId: z.string().optional(),
  }),
});

export const RoomHousekeepingValidation = { getAll, create, update };
