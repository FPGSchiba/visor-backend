import { createLogger, format, transports } from 'winston';
const { printf, timestamp, combine, splat, colorize, errors, align } = format;

let level = process.env.LOGGING_LEVEL;
if (!level) {
  level = process.env.NODE_ENV === 'test' ? 'debug' : 'info';
}

export const loggerOptions = {
  level,
  format: combine(
    splat(),
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    align(),
    printf(({ level, message, timestamp, stack }) => `[${level}] ${timestamp}: ${message} \n ${stack || ''}`),
  ),
  transports: [new transports.Console({ level })],
}

export const LOG = createLogger(loggerOptions);
