import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan'
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import router from './app/routes';
import config from './config';
import helmet from 'helmet';
import { notFound } from './middlewares/notFound';

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

const app: Application = express();
const corsOptions = {
  origin: config.frontend_url || 'http://localhost:3000',
  credentials: true,
};
app.use(helmet())
app.use(cors(corsOptions));
app.use(cookieParser());
if (config.env === 'development') {
  app.use(morgan('dev'))
}
app.use(express.json({
  limit: '5mb',
  verify: (req, _res, buf) => {
    (req as { rawBody?: Buffer }).rawBody = buf;
  },
}))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

app.use('/api/v1', router);
app.use(notFound)
app.use(globalErrorHandler);

export default app;
