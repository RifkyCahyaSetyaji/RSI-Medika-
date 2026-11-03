import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { validasiPassword } from '../services/akun.service.js';

function buatToken(akun) {
  return jwt.sign(
    { idPegawai: akun.idPegawai, role: akun.role },
    env.jwt.secret,
    { subject: akun.idAkun, expiresIn: env.jwt.expiresIn },
  );
}

export const login = asyncHandler(async (req, res) => {
  // "username" boleh diisi username atau email pegawai
  const { username, email, password } = req.body || {};
  const identitas = (username || email || '').trim();
  if (!identitas || !password) {
    throw new ApiError(400, 'Email/username dan password wajib diisi');
  }

  const akun = await prisma.akun.findFirst({
    where: {
      OR: [
        { username: identitas },
        { pegawai: { email: { equals: identitas, mode: 'insensitive' } } },
      ],
    },
    include: { pegawai: true },
  });

  // Pesan sengaja sama agar tidak membocorkan username yang valid
  const valid = akun && (await bcrypt.compare(password, akun.password));
  if (!valid) throw new ApiError(401, 'Email/username atau password salah');

  if (akun.pegawai.statusPegawai !== 'Aktif') {
    throw new ApiError(403, 'Akun pegawai tidak aktif');
  }

  res.json({
    success: true,
    data: {
      token: buatToken(akun),
      user: {
        idAkun: akun.idAkun,
        username: akun.username,
        role: akun.role,
        pegawai: {
          idPegawai: akun.pegawai.idPegawai,
          nama: akun.pegawai.nama,
          email: akun.pegawai.email,
          jabatan: akun.pegawai.jabatan,
          unitKerja: akun.pegawai.unitKerja,
        },
      },
    },
  });
});

/** POST /api/auth/ganti-password — body: { passwordLama, passwordBaru } */
export const gantiPassword = asyncHandler(async (req, res) => {
  const { passwordLama, passwordBaru } = req.body || {};
  if (!passwordLama || !passwordBaru) {
    throw new ApiError(400, 'Password lama dan password baru wajib diisi');
  }
  validasiPassword(passwordBaru);
  if (passwordLama === passwordBaru) {
    throw new ApiError(400, 'Password baru tidak boleh sama dengan password lama');
  }

  const akun = await prisma.akun.findUnique({ where: { idAkun: req.user.idAkun } });
  if (!akun) throw new ApiError(404, 'Akun tidak ditemukan');
  if (!(await bcrypt.compare(passwordLama, akun.password))) {
    throw new ApiError(400, 'Password lama salah');
  }

  const updated = await prisma.akun.update({
    where: { idAkun: akun.idAkun },
    data: { password: await bcrypt.hash(passwordBaru, 12) },
  });

  res.json({ success: true, message: 'Password berhasil diganti', data: { token: buatToken(updated) } });
});

export const me = asyncHandler(async (req, res) => {
  const akun = await prisma.akun.findUnique({
    where: { idAkun: req.user.idAkun },
    select: {
      idAkun: true,
      username: true,
      role: true,
      pegawai: {
        select: {
          idPegawai: true,
          nama: true,
          nip: true,
          email: true,
          jabatan: true,
          unitKerja: true,
          statusPegawai: true,
          sisaJatahCuti: true,
          peran_tenaga_medis: { select: { idPeran: true, namaPeran: true, kategori: true } },
        },
      },
    },
  });

  if (!akun) throw new ApiError(404, 'Akun tidak ditemukan');
  res.json({ success: true, data: akun });
});
