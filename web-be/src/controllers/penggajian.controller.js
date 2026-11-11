import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';
import {
  includeGaji,
  periodeSekarang,
  prosesHitungPegawai,
  rentangPeriode,
  serializeGaji,
  susunRincianSlip,
} from '../services/penggajian.service.js';

const fmtWaktu = (d) => (d ? d.toISOString().slice(0, 19).replace('T', ' ') : null);

/** GET /api/penggajian/saya?periode= — daftar slip gaji milik pegawai yang login. */
export const gajiSaya = asyncHandler(async (req, res) => {
  const { periode } = req.query;
  if (periode) rentangPeriode(periode);

  const list = await prisma.penggajian.findMany({
    where: { idPegawai: req.user.idPegawai, ...(periode && { periodeGaji: periode }) },
    include: includeGaji,
    orderBy: { periodeGaji: 'desc' },
  });

  const data = await Promise.all(list.map(susunRincianSlip));
  res.json({ success: true, data });
});

/** GET /api/penggajian?periode=&statusPembayaran=&idPegawai= — HRD & Manajemen Keuangan. */
export const daftarGaji = asyncHandler(async (req, res) => {
  const { periode, statusPembayaran, idPegawai } = req.query;
  if (periode) rentangPeriode(periode);

  const list = await prisma.penggajian.findMany({
    where: {
      ...(periode && { periodeGaji: periode }),
      ...(statusPembayaran && { statusPembayaran }),
      ...(idPegawai && { idPegawai }),
    },
    include: includeGaji,
    orderBy: [{ periodeGaji: 'desc' }, { idGaji: 'desc' }],
  });

  res.json({ success: true, data: list.map((g) => serializeGaji(g)) });
});

/** GET /api/penggajian/:idGaji — detail slip gaji lengkap (pemilik, HRD, Manajemen Keuangan). */
export const detailGaji = asyncHandler(async (req, res) => {
  const g = await prisma.penggajian.findUnique({
    where: { idGaji: req.params.idGaji },
    include: includeGaji,
  });
  if (!g) throw new ApiError(404, 'Data penggajian tidak ditemukan');

  const pengelola = [ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN].includes(req.user.role);
  if (!pengelola && g.idPegawai !== req.user.idPegawai) {
    throw new ApiError(403, 'Anda tidak memiliki akses ke slip gaji ini');
  }

  const transaksi = await prisma.transaksi_pembayaran.findMany({
    where: { idPegawai: g.idPegawai, jenisTransaksi: `Gaji ${g.periodeGaji}` },
    include: { rekening_pegawai: true },
    orderBy: { tanggalTransaksi: 'desc' },
  });

  const slip = await susunRincianSlip(g);
  res.json({
    success: true,
    data: {
      ...slip,
      transaksiPembayaran: transaksi.map((t) => ({
        ...t,
        nominal: Number(t.nominal),
        tanggalTransaksi: fmtWaktu(t.tanggalTransaksi),
      })),
    },
  });
});

/**
 * POST /api/penggajian/hitung — hitung/generate gaji 1 pegawai pada suatu periode.
 * body: { idPegawai, periodeGaji?, nilaiJasaMedis?, tunjanganTambahan?, potonganTambahan?, ...overrideMetrik }
 */
export const hitungGajiPegawai = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { idPegawai } = body;
  const periode = body.periodeGaji || periodeSekarang();
  if (!idPegawai) throw new ApiError(400, 'idPegawai wajib diisi');
  rentangPeriode(periode);

  const pegawai = await prisma.pegawai.findUnique({
    where: { idPegawai },
    include: { peran_tenaga_medis: true },
  });
  if (!pegawai) throw new ApiError(404, 'Pegawai tidak ditemukan');

  const data = await prosesHitungPegawai(pegawai, periode, body);
  res.status(201).json({ success: true, message: `Gaji ${pegawai.nama} periode ${periode} berhasil dihitung`, data });
});

/**
 * POST /api/penggajian/hitung-bulk — generate gaji seluruh pegawai aktif yang punya peran pada suatu periode.
 * body: { periodeGaji?, idPegawai?: [..] }
 */
export const hitungGajiBulk = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const periode = body.periodeGaji || periodeSekarang();
  rentangPeriode(periode);

  const pegawaiList = await prisma.pegawai.findMany({
    where: {
      statusPegawai: 'Aktif',
      idPeran: { not: null },
      ...(Array.isArray(body.idPegawai) && body.idPegawai.length > 0 && { idPegawai: { in: body.idPegawai } }),
    },
    include: { peran_tenaga_medis: true },
    orderBy: { nama: 'asc' },
  });

  const berhasil = [];
  const dilewati = [];

  for (const p of pegawaiList) {
    try {
      const g = await prosesHitungPegawai(p, periode);
      berhasil.push(g);
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      dilewati.push({ idPegawai: p.idPegawai, nama: p.nama, alasan: err.message });
    }
  }

  res.status(201).json({
    success: true,
    message: `${berhasil.length} slip gaji periode ${periode} berhasil dihitung`,
    data: { periode, jumlahBerhasil: berhasil.length, jumlahDilewati: dilewati.length, berhasil, dilewati },
  });
});
