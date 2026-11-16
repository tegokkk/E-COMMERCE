import pino from 'pino';
import { pinoHttp } from 'pino-http';
import { env } from './env.js';

export const loggerRedaction = {
  paths: [
    'req.headers.cookie',
    'req.headers.authorization',
    'req.headers["x-csrf-token"]',
    'req.headers["x-xsrf-token"]',
    'req.headers["x-api-key"]',
    'password',
    'currentPassword',
    'newPassword',
    'passwordHash',
    'token',
    'csrfToken',
    'accessToken',
    'refreshToken',
    'apiKey',
    'phone',
    'whatsapp',
    'req.body.password',
    'req.body.currentPassword',
    'req.body.newPassword',
    'req.body.whatsapp',
    'req.body.token',
    'req.body.csrfToken',
    'rawSearch',
    'properties.phone',
  ],
  censor: '[TERSEMBUNYI]',
};

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: loggerRedaction,
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: env.NODE_ENV !== 'test',
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url?.split('?')[0], // Jangan mencatat raw query parameter pencarian sensitif
      };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
  },
});
