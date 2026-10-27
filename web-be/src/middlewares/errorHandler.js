import { env } from '../config/env.js';
import { ApiError } from '../utils/http.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} tidak ditemukan`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(err.details && { details: err.details }),
    ...(env.nodeEnv === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
}
