import Redis from 'ioredis';
import config from '../config';
import logger from '../utils/logger';

const redis = new Redis(config.redis_url, { maxRetriesPerRequest: null });

export const redisClient = {
  get: (key: string) => redis.get(key),
  set: (key: string, value: string, ttlSec?: number) =>
    ttlSec ? redis.set(key, value, 'EX', ttlSec) : redis.set(key, value),
  del: (key: string) => redis.del(key),
  acquireLock: async (key: string, ttlMs: number): Promise<boolean> =>
    (await redis.set(`lock:${key}`, '1', 'PX', ttlMs, 'NX')) === 'OK',
  releaseLock: (key: string) => redis.del(`lock:${key}`),
  raw: redis,
};

export const connectRedis = async (): Promise<void> => {
  if (redis.status === 'ready') return;
  await new Promise<void>((resolve, reject) => {
    redis.once('ready', () => resolve());
    redis.once('error', (err) => reject(err));
  });
  logger.info('Redis connected');
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redis.quit();
  } catch (err) {
    logger.error('Redis disconnect error', err);
  }
};
