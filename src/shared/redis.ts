import { Redis } from 'ioredis';
import config from '../config';

const redisClient = new Redis(config.redis_url);

redisClient.on('error', (err) => console.error(' Redis Configuration Pipeline Bug Error:', err));
redisClient.on('connect', () => console.log(' Redis Stream Linked Cache Engine Stable!'));

const connectRedis = async (): Promise<void> => {
  if (redisClient.status === 'end' || redisClient.status === 'close') {
    await redisClient.connect();
  }
};

export const RedisService = {
  connectRedis,
  client: redisClient,
};
