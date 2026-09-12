import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Environment variable "${key}" is not defined`);
  }
  return value;
};

type Config = {
  env: string;
  port: number;
  frontend_url: string | undefined;
  base_url: string | undefined;
  database_url: string;
  salt_rounds: number;
  jwt: {
    secret: string;
    expires_in: string;
    refresh_expires_in: string;
  };
  cloudinary: {
    cloud_name: string | undefined;
    api_key: string | undefined;
    api_secret: string | undefined;
  };
  ai_api_key: string | undefined;
  stripe: {
    secret_key: string;
    publishable_key: string;
    webhook_secret: string;
  };
  sslcommerz: {
    store_id: string | undefined;
    store_password: string | undefined;
    is_live: boolean;
  };
  email: {
    app_password: string | undefined;
    support_email: string | undefined;
  };
  maps: {
    provider: string;
    api_key: string;
  };
  booking: {
    hold_minutes: number;
  };
  redis_url: string;
};

const config: Config = {
  env: getEnv('NODE_ENV', 'development'),
  port: Number(process.env.PORT) || 5000,
  frontend_url: process.env.FRONTEND_URL,
  base_url: process.env.BASE_URL,
  database_url: getEnv('DATABASE_URL'),
  salt_rounds: Number(process.env.SALT_ROUND) || 10,
  jwt: {
    secret: getEnv('JWT_SECRET', 'supersecretkey'),
    expires_in: getEnv('JWT_EXPIRES_IN', '1h'),
    refresh_expires_in: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  },
  cloudinary: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  },
  ai_api_key: process.env.AI_API_KEY,
  stripe: {
    secret_key: getEnv('STRIPE_SECRET_KEY', ''),
    publishable_key: getEnv('STRIPE_PUBLISHABLE_KEY', ''),
    webhook_secret: getEnv('STRIPE_WEBHOOK_SECRET', ''),
  },
  sslcommerz: {
    store_id: process.env.Store_ID,
    store_password: process.env.Store_Password,
    is_live: false,
  },
  email: {
    app_password: process.env.APP_PASSWORD,
    support_email: process.env.SUPPORT_EMAIL,
  },
  maps: {
    provider: getEnv('MAPS_PROVIDER', 'mapbox'),
    api_key: getEnv('MAPS_API_KEY', ''),
  },
  booking: {
    hold_minutes: Number(process.env.BOOKING_HOLD_MINUTES) || 15,
  },
  redis_url: getEnv('REDIS_URL', 'redis://localhost:6379'),
};

export default config;
