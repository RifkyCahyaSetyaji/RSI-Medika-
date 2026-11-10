import prisma from '../config/prisma.js';
import { asyncHandler } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';
import { buatAkunPegawai } from '../services/akun.service.js';

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

