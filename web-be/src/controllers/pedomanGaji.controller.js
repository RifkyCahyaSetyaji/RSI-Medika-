import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { parseTanggal } from '../utils/jadwal.js';
import { serializePedoman } from '../services/penggajian.service.js';

const KOMPONEN_ANGKA = [
  'gajiPokok',
  'tunjanganJabatan',
  'tunjanganShiftMalam',
  'uangLemburPerJam',
  'tunjanganKehadiranPerHari',
  'persenInsentifJasaMedis',
  'potonganTidakHadirPerHari',
  'potonganTerlambatPerKejadian',
];

const includePeran = {
  peran_tenaga_medis: { select: { idPeran: true, namaPeran: true, kategori: true } },
};

function ambilDataKomponen(body, { wajibGajiPokok = false } = {}) {
  const data = {};
  if (wajibGajiPokok && body.gajiPokok == null) {
    throw new ApiError(400, 'gajiPokok wajib diisi');
  }
  for (const k of KOMPONEN_ANGKA) {
    if (body[k] == null) continue;
    const val = Number(body[k]);
    if (!Number.isFinite(val) || val < 0) throw new ApiError(400, `${k} harus berupa angka >= 0`);
    if (k === 'persenInsentifJasaMedis' && val > 100) {
      throw new ApiError(400, 'persenInsentifJasaMedis harus antara 0 s/d 100');
    }
    data[k] = val;
  }
  return data;
}

/** GET /api/pedoman-gaji?idPeran=&aktif=true */
export const daftarPedoman = asyncHandler(async (req, res) => {
  const { idPeran, aktif } = req.query;
  const today = new Date();

  const data = await prisma.pedoman_penggajian.findMany({
    where: {
      ...(idPeran && { idPeran }),
      ...(aktif === 'true' && {
        berlakuMulai: { lte: today },
        OR: [{ berlakuSampai: null }, { berlakuSampai: { gte: today } }],
      }),
    },
    include: includePeran,
    orderBy: [{ idPeran: 'asc' }, { berlakuMulai: 'desc' }],
  });
  res.json({ success: true, data: data.map(serializePedoman) });
});

/** GET /api/pedoman-gaji/:idPedoman */
export const detailPedoman = asyncHandler(async (req, res) => {
  const p = await prisma.pedoman_penggajian.findUnique({
    where: { idPedoman: req.params.idPedoman },
    include: includePeran,
  });
  if (!p) throw new ApiError(404, 'Pedoman penggajian tidak ditemukan');
  res.json({ success: true, data: serializePedoman(p) });
});

/**
 * POST /api/pedoman-gaji
 * body: { idPeran, gajiPokok, berlakuMulai, berlakuSampai?, keterangan?, ...komponen }
 */
export const buatPedoman = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { idPeran, berlakuMulai, berlakuSampai, keterangan } = body;
  if (!idPeran || !berlakuMulai) throw new ApiError(400, 'idPeran dan berlakuMulai wajib diisi');

  const mulai = parseTanggal(berlakuMulai);
  const sampai = berlakuSampai ? parseTanggal(berlakuSampai) : null;
  if (!mulai || (berlakuSampai && !sampai)) {
    throw new ApiError(400, 'Format tanggal harus YYYY-MM-DD');
  }
  if (sampai && sampai < mulai) {
    throw new ApiError(400, 'berlakuSampai tidak boleh sebelum berlakuMulai');
  }

  const peran = await prisma.peran_tenaga_medis.findUnique({ where: { idPeran } });
  if (!peran) throw new ApiError(404, 'Peran tenaga medis tidak ditemukan');

  const komponen = ambilDataKomponen(body, { wajibGajiPokok: true });

  const data = await prisma.pedoman_penggajian.create({
    data: {
      idPeran,
      ...komponen,
      berlakuMulai: mulai,
      berlakuSampai: sampai,
      keterangan: keterangan?.trim() || null,
    },
    include: includePeran,
  });
  res.status(201).json({ success: true, message: 'Pedoman penggajian dibuat', data: serializePedoman(data) });
});

/** PATCH /api/pedoman-gaji/:idPedoman */
export const ubahPedoman = asyncHandler(async (req, res) => {
  const existing = await prisma.pedoman_penggajian.findUnique({ where: { idPedoman: req.params.idPedoman } });
  if (!existing) throw new ApiError(404, 'Pedoman penggajian tidak ditemukan');

  const body = req.body || {};
  const komponen = ambilDataKomponen(body);
  const mulai = body.berlakuMulai ? parseTanggal(body.berlakuMulai) : existing.berlakuMulai;
  const sampai =
    body.berlakuSampai === undefined
      ? existing.berlakuSampai
      : body.berlakuSampai
        ? parseTanggal(body.berlakuSampai)
        : null;

  if (!mulai || (body.berlakuSampai && !sampai)) {
    throw new ApiError(400, 'Format tanggal harus YYYY-MM-DD');
  }
  if (sampai && sampai < mulai) {
    throw new ApiError(400, 'berlakuSampai tidak boleh sebelum berlakuMulai');
  }

  const data = await prisma.pedoman_penggajian.update({
    where: { idPedoman: existing.idPedoman },
    data: {
      ...komponen,
      berlakuMulai: mulai,
      berlakuSampai: sampai,
      ...(body.keterangan !== undefined && { keterangan: body.keterangan?.trim() || null }),
    },
    include: includePeran,
  });
  res.json({ success: true, message: 'Pedoman penggajian diperbarui', data: serializePedoman(data) });
});

/** DELETE /api/pedoman-gaji/:idPedoman */
export const hapusPedoman = asyncHandler(async (req, res) => {
  const dipakai = await prisma.penggajian.count({ where: { idPedoman: req.params.idPedoman } });
  if (dipakai > 0) {
    throw new ApiError(400, 'Pedoman sudah dipakai pada data penggajian, tidak bisa dihapus. Batasi masa berlakunya saja.');
  }
  await prisma.pedoman_penggajian.delete({ where: { idPedoman: req.params.idPedoman } });
  res.json({ success: true, message: 'Pedoman penggajian dihapus' });
});

