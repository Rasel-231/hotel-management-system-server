import { redisClient } from '../database/redis';

const lockKey = (roomId: string, date: string) => `booking:lock:${roomId}:${date}`;

export const datesBetween = (checkIn: Date, checkOut: Date): string[] => {
  const dates: string[] = [];
  const cur = new Date(checkIn);
  cur.setUTCHours(0, 0, 0, 0);
  const end = new Date(checkOut);
  while (cur < end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
};

export const acquireBookingLocks = async (
  roomId: string,
  dates: string[]
): Promise<boolean> => {
  for (const d of dates) {
    const ok = await redisClient.acquireLock(lockKey(roomId, d), 30 * 60 * 1000);
    if (!ok) {
      await releaseBookingLocks(roomId, dates);
      return false;
    }
  }
  return true;
};

export const releaseBookingLocks = async (
  roomId: string,
  dates: string[]
): Promise<void> => {
  await Promise.all(dates.map((d) => redisClient.releaseLock(lockKey(roomId, d))));
};
