import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { pastikanPeranPunyaPedoman } from '../services/akun.service.js';

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

/** PATCH /api/hrd/pegawai/:idPegawai/peran — body: { idPeran, idPeranList } */
export const ubahPeranPegawai = asyncHandler(async (req, res) => {
  const { idPegawai } = req.params;
  const { idPeran, idPeranList } = req.body || {};

  let peransToSet = undefined;
  if (idPeranList !== undefined) {
    peransToSet = Array.isArray(idPeranList) ? idPeranList.filter(Boolean) : [];
  } else if (idPeran !== undefined) {
    peransToSet = idPeran ? [idPeran] : [];
  }

  if (peransToSet !== undefined && peransToSet.length > 0) {
    for (const pid of peransToSet) {
      await pastikanPeranPunyaPedoman(pid);
    }
  }

  const pegawai = await prisma.pegawai.findUnique({ where: { idPegawai } });
  if (!pegawai) throw new ApiError(404, 'Pegawai tidak ditemukan');

  const data = await prisma.$transaction(async (tx) => {
    if (peransToSet !== undefined) {
      await tx.pegawai_peran.deleteMany({ where: { idPegawai } });
      if (peransToSet.length > 0) {
        await tx.pegawai_peran.createMany({
          data: peransToSet.map((pid, idx) => ({
            idPegawai,
            idPeran: pid,
            isPrimary: idx === 0,
          })),
        });
      }
    }

    return tx.pegawai.update({
      where: { idPegawai },
      data: { idPeran: peransToSet !== undefined ? (peransToSet[0] || null) : (idPeran || null) },
      select: {
        idPegawai: true,
        nama: true,
        peran_tenaga_medis: true,
        pegawai_peran: {
          include: {
            peran_tenaga_medis: true,
          },
        },
      },
    });
  });

  res.json({ success: true, data });
});

