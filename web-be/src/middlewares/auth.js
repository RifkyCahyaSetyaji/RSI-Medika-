import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { ApiError } from '../utils/http.js';

/** Verifikasi header "Authorization: Bearer <token>" lalu isi req.user. */
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Token tidak ditemukan'));
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = {
      idAkun: payload.sub,
      idPegawai: payload.idPegawai,
      role: payload.role,
    };
    next();
  } catch {
    next(new ApiError(401, 'Token tidak valid atau sudah kedaluwarsa'));
  }
}

/** Batasi akses berdasarkan role. Pakai setelah authenticate. */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Belum login'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Anda tidak memiliki akses ke resource ini'));
    }
    next();
  };
