import pino from 'pino';

export const logger = pino({
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino/file', options: { destination: 1 } }
      : undefined,
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'headers.authorization',
      '*.password',
      '*.token',
    ],
    censor: '[Redacted]',
  },
});
