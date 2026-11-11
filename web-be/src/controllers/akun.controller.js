import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';
import { buatAkunPegawai } from '../services/akun.service.js';

/** Role yang boleh dibuat oleh HRD (HRD & Super Admin hanya oleh Super Admin). */
export const ROLE_DARI_HRD = [ROLES.TENAGA_MEDIS, ROLES.SEKRETARIS_UNIT, ROLES.MANAJEMEN_KEUANGAN];

/** POST /api/admin/akun-hrd — Super Admin membuat akun HRD dari email pegawai. */
export const buatAkunHrd = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const result = await buatAkunPegawai({ email, password, role: ROLES.HRD });
  res.status(201).json({ success: true, data: result });
});

/** GET /api/admin/akun-hrd — daftar akun HRD. */
export const daftarAkunHrd = asyncHandler(async (req, res) => {
  const data = await prisma.akun.findMany({
    where: { role: ROLES.HRD },
    select: {
      idAkun: true,
      username: true,
      role: true,
      pegawai: { select: { idPegawai: true, nama: true, email: true, statusPegawai: true } },
    },
  });
  res.json({ success: true, data });
});

/** GET /api/hrd/pegawai-tanpa-akun — pegawai aktif yang belum punya akun. */
export const pegawaiTanpaAkun = asyncHandler(async (req, res) => {
  const data = await prisma.pegawai.findMany({
    where: { akun: null, statusPegawai: 'Aktif' },
    select: { idPegawai: true, nama: true, nip: true, email: true, jabatan: true, unitKerja: true, idPeran: true },
    orderBy: { nama: 'asc' },
  });
  res.json({ success: true, data });
});

/** POST /api/hrd/akun — body: { email, password, role, idPeran? } */
export const buatAkun = asyncHandler(async (req, res) => {
  const { email, password, role, idPeran } = req.body || {};
  if (!ROLE_DARI_HRD.includes(role)) {
    throw new ApiError(400, `Role harus salah satu dari: ${ROLE_DARI_HRD.join(', ')}`);
  }
  const result = await buatAkunPegawai({ email, password, role, idPeran });
  res.status(201).json({ success: true, data: result });
});

