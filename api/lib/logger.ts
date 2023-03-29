import pino, { LoggerOptions } from 'pino';

const { LOG_LEVEL = 'info', LOG_STYLE } = process.env;

const pinoOptions: LoggerOptions = { level: LOG_LEVEL };

if (LOG_STYLE !== 'raw') {
  pinoOptions.prettyPrint = true;
  pinoOptions.prettifier = require('pino-colada');
}

const logger = pino(pinoOptions);

export default logger;
