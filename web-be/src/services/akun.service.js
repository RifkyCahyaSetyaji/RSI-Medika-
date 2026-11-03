import bcrypt from 'bcryptjs';

import prisma from '../config/prisma.js';
import { ApiError } from '../utils/http.js';
import { kirimEmailAkunBaru } from '../utils/mailer.js';

export const MIN_PASSWORD = 8;

export function validasiPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) {
    throw new ApiError(400, `Password minimal ${MIN_PASSWORD} karakter`);
  }
}

/**
 * Buat akun untuk pegawai yang SUDAH terdaftar (dicari berdasarkan email),
 * lalu kirim email berisi kredensial + perintah ganti password.
 */
export async function buatAkunPegawai({ email, password, role, idPeran }) {
  if (!email || !password || !role) {
    throw new ApiError(400, 'Email, password, dan role wajib diisi');
  }
  validasiPassword(password);

  const pegawai = await prisma.pegawai.findFirst({
    where: { email: { equals: String(email).trim(), mode: 'insensitive' } },
    include: { akun: true },
  });

  if (!pegawai) throw new ApiError(404, 'Pegawai dengan email tersebut tidak ditemukan');
  if (pegawai.akun) throw new ApiError(409, 'Pegawai ini sudah memiliki akun');
  if (pegawai.statusPegawai !== 'Aktif') throw new ApiError(400, 'Pegawai tidak berstatus Aktif');

  if (idPeran) await pastikanPeranPunyaPedoman(idPeran);

  // username = email pegawai (kolom username maks 50 karakter, fallback ke NIP)
  const username = pegawai.email.length <= 50 ? pegawai.email : pegawai.nip;
  const hash = await bcrypt.hash(password, 12);

  const akun = await prisma.$transaction(async (tx) => {
    if (idPeran) {
      await tx.pegawai.update({ where: { idPegawai: pegawai.idPegawai }, data: { idPeran } });
    }
    return tx.akun.create({
      data: { idPegawai: pegawai.idPegawai, username, password: hash, role },
      select: { idAkun: true, idPegawai: true, username: true, role: true },
    });
  });

  let emailTerkirim = true;
  let emailError;
  try {
    await kirimEmailAkunBaru({ to: pegawai.email, nama: pegawai.nama, username, password, role });
  } catch (err) {
    emailTerkirim = false;
    emailError = err.message;
    console.error('[mailer] Gagal kirim email akun baru:', err.message);
  }

  return { akun, emailTerkirim, emailError };
}

/** Peran hanya boleh dipakai jika punya pedoman penggajian yang masih berlaku. */
export async function pastikanPeranPunyaPedoman(idPeran) {
  const today = new Date();
  const pedoman = await prisma.pedoman_penggajian.findFirst({
    where: {
      idPeran,
      berlakuMulai: { lte: today },
      OR: [{ berlakuSampai: null }, { berlakuSampai: { gte: today } }],
    },
  });
  if (!pedoman) {
    throw new ApiError(400, 'Peran tidak ditemukan atau belum memiliki pedoman penggajian yang berlaku');
  }
  return pedoman;
}
