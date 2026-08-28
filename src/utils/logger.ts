import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

const logDir = path.join(__dirname, '..', '..', 'logs');


const successTransport = new winston.transports.DailyRotateFile({
  level: 'info',
  dirname: path.join(logDir, 'success'),
  filename: '%DATE%-success.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '12m',
});


const errorTransport = new winston.transports.DailyRotateFile({
  level: 'error',
  dirname: path.join(logDir, 'error'),
  filename: '%DATE%-error.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '12m',
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    errorTransport,
    successTransport,
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })
  ]
});


if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.simple()
      ),
    })
  );
}

/**

 * @param errorTitle 
 * @param error 
 */
export const logError = (errorTitle: string, error: any) => {
  logger.error({
    title: errorTitle,
    message: error.message || error,
    stack: error.stack || null,
  });
};

/**

 * @param successTitle
 * @param message
 */
export const logSuccess = (successTitle: string, message: string) => {
  logger.info({
    title: successTitle,
    message: message,
  });
};

export default logger;