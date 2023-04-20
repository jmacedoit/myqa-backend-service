
/*
 * Module dependencies.
 */

import { createLogger, format, transports } from 'winston';
import DailyRotateFileTransport from 'winston-daily-rotate-file';
import config from 'src/config';
import stripAnsi from 'strip-ansi';

/*
 * Logger setup.
 */

function serializerFactory(shouldStripAnsi: boolean) {
  return format.printf(all => {
    const { data, label, level, message, timestamp } = all;
    const processedMessage = shouldStripAnsi ? stripAnsi(message) : message;
    const pid = process.pid.toString();

    return `${pid} ${timestamp}|${level}: ${label ? `[${label}] ` : ''}${processedMessage || ''} ${data ? JSON.stringify(data) : ''}`;
  });
}

function getDefaultSerializer() {
  let serializer;

  if (config.logger.format === 'json') {
    serializer = format.json();
  } else if (config.logger.format === 'logstash') {
    serializer = format.logstash();
  } else {
    serializer = serializerFactory(false);
  }

  return serializer;
}

const fileTransport = new DailyRotateFileTransport({
  datePattern: config.logger.datePattern,
  dirname: 'logs',
  filename: `${config.serviceName}-%DATE%.log`,
  maxFiles: config.logger.maxFiles,
  maxSize: config.logger.maxSize,
  zippedArchive: config.logger.zippedArchive,
  format: format.combine(
    format.splat(),
    format.timestamp(),
    serializerFactory(true)
  )
});

const logger = createLogger({
  level: config.logger.level,
  transports: [
    new transports.Console({
      format: format.combine(
        format.splat(),
        format.colorize(),
        format.timestamp(),
        getDefaultSerializer()
      )
    }),
    fileTransport
  ]
});

/*
 * Module exports.
 */

export default logger;
