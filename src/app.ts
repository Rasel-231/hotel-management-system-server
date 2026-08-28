import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import router from './app/routes';

const app: Application = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ message: 'Server is running' });
});

app.use('/api/v1', router);

app.use(globalErrorHandler);

export default app;
