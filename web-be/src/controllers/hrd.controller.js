import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';
import { buatAkunPegawai, pastikanPeranPunyaPedoman } from '../services/akun.service.js';

/** Role yang boleh dibuat oleh HRD (HRD & Super Admin hanya oleh Super Admin). */
export const ROLE_DARI_HRD = [ROLES.TENAGA_MEDIS, ROLES.SEKRETARIS_UNIT, ROLES.MANAJEMEN_KEUANGAN];

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

/** GET /api/hrd/peran — peran beserta pedoman penggajian yang sedang berlaku. */
export const daftarPeran = asyncHandler(async (req, res) => {
  const today = new Date();
  const peran = await prisma.peran_tenaga_medis.findMany({
    orderBy: { namaPeran: 'asc' },
    include: {
      pedoman_penggajian: {
        where: {
          berlakuMulai: { lte: today },
          OR: [{ berlakuSampai: null }, { berlakuSampai: { gte: today } }],
        },
        orderBy: { berlakuMulai: 'desc' },
        take: 1,
      },
    },
  });
  const data = peran.map(({ pedoman_penggajian, ...p }) => ({
    ...p,
    pedomanBerlaku: pedoman_penggajian[0] ?? null,
  }));
  res.json({ success: true, data });
});

/**
 * POST /api/hrd/peran — tambah peran baru sekaligus pedoman penggajiannya.
 * body: { namaPeran, kategori, deskripsi?, pedoman: { gajiPokok, berlakuMulai, ...komponen } }
 */
export const tambahPeran = asyncHandler(async (req, res) => {
  const { namaPeran, kategori, deskripsi, pedoman } = req.body || {};
  if (!namaPeran || !kategori) throw new ApiError(400, 'namaPeran dan kategori wajib diisi');
  if (!pedoman || pedoman.gajiPokok == null || !pedoman.berlakuMulai) {
    throw new ApiError(400, 'pedoman.gajiPokok dan pedoman.berlakuMulai wajib diisi');
  }

  const ada = await prisma.peran_tenaga_medis.findUnique({ where: { namaPeran } });
  if (ada) throw new ApiError(409, 'Nama peran sudah ada');

  const komponen = [
    'tunjanganJabatan',
    'tunjanganShiftMalam',
    'uangLemburPerJam',
    'tunjanganKehadiranPerHari',
    'persenInsentifJasaMedis',
    'potonganTidakHadirPerHari',
    'potonganTerlambatPerKejadian',
  ];
  const dataPedoman = {
    gajiPokok: pedoman.gajiPokok,
    berlakuMulai: new Date(pedoman.berlakuMulai),
    berlakuSampai: pedoman.berlakuSampai ? new Date(pedoman.berlakuSampai) : null,
    keterangan: pedoman.keterangan ?? null,
  };
  for (const k of komponen) if (pedoman[k] != null) dataPedoman[k] = pedoman[k];

  const data = await prisma.peran_tenaga_medis.create({
    data: {
      namaPeran,
      kategori,
      deskripsi: deskripsi ?? null,
      pedoman_penggajian: { create: dataPedoman },
    },
    include: { pedoman_penggajian: true },
  });
  res.status(201).json({ success: true, data });
});

/** PATCH /api/hrd/pegawai/:idPegawai/peran — body: { idPeran } (null untuk menghapus). */
export const ubahPeranPegawai = asyncHandler(async (req, res) => {
  const { idPegawai } = req.params;
  const { idPeran } = req.body || {};
  if (idPeran) await pastikanPeranPunyaPedoman(idPeran);

  const pegawai = await prisma.pegawai.findUnique({ where: { idPegawai } });
  if (!pegawai) throw new ApiError(404, 'Pegawai tidak ditemukan');

  const data = await prisma.pegawai.update({
    where: { idPegawai },
    data: { idPeran: idPeran || null },
    select: { idPegawai: true, nama: true, peran_tenaga_medis: true },
  });
  res.json({ success: true, data });
});

