import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';

/** GET /api/penggajian/rekening/saya */
export const rekeningSaya = asyncHandler(async (req, res) => {
  const data = await prisma.rekening_pegawai.findMany({
    where: { idPegawai: req.user.idPegawai },
    orderBy: { idRekening: 'asc' },
  });
  res.json({ success: true, data });
});

/** POST /api/penggajian/rekening — body: { namaBank, nomorRekening, atasNama, idPegawai? (khusus HRD/Keuangan) } */
export const tambahRekening = asyncHandler(async (req, res) => {
  const { namaBank, nomorRekening, atasNama, idPegawai } = req.body || {};
  if (!namaBank?.trim() || !nomorRekening?.trim() || !atasNama?.trim()) {
    throw new ApiError(400, 'namaBank, nomorRekening, dan atasNama wajib diisi');
  }

  const pengelola = [ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN].includes(req.user.role);
  const targetPegawai = pengelola && idPegawai ? idPegawai : req.user.idPegawai;

  const data = await prisma.rekening_pegawai.create({
    data: {
      idPegawai: targetPegawai,
      namaBank: namaBank.trim(),
      nomorRekening: nomorRekening.trim(),
      atasNama: atasNama.trim(),
    },
  });
  res.status(201).json({ success: true, message: 'Rekening berhasil ditambahkan', data });
});

/** DELETE /api/penggajian/rekening/:idRekening */
export const hapusRekening = asyncHandler(async (req, res) => {
  const rek = await prisma.rekening_pegawai.findUnique({ where: { idRekening: req.params.idRekening } });
  if (!rek) throw new ApiError(404, 'Rekening tidak ditemukan');

  const pengelola = [ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN].includes(req.user.role);
  if (!pengelola && rek.idPegawai !== req.user.idPegawai) {
    throw new ApiError(403, 'Anda tidak berhak menghapus rekening ini');
  }

  const dipakai = await prisma.transaksi_pembayaran.count({ where: { idRekening: rek.idRekening } });
  if (dipakai > 0) {
    throw new ApiError(400, 'Rekening sudah memiliki riwayat transaksi pembayaran dan tidak bisa dihapus');
  }

  await prisma.rekening_pegawai.delete({ where: { idRekening: rek.idRekening } });
  res.json({ success: true, message: 'Rekening dihapus' });
});

