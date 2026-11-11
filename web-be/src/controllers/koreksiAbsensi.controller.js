import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { sekarang } from '../utils/jadwal.js';
import { scopePegawai } from '../services/jadwal.service.js';
import {
  KEHADIRAN,
  barisRiwayat,
  batasJadwal,
  parseWaktu,
  statusMasuk,
  statusPulang,
  validasiWaktuKoreksi,
} from '../services/absensi.service.js';

export const STATUS = Object.freeze({
  MENUNGGU: 'Menunggu',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
  DIBATALKAN: 'Dibatalkan',
});

const fmt = (d) => (d ? d.toISOString().slice(0, 19).replace('T', ' ') : null);

const includeDetail = {
  absensi: {
    include: {
      jadwal: true,
      pegawai: { select: { idPegawai: true, nama: true, unitKerja: true } },
    },
  },
};

function serializeKoreksi(k) {
  const { absensi, ...rest } = k;
  return {
    ...rest,
    waktuMasukBaru: fmt(k.waktuMasukBaru),
    waktuPulangBaru: fmt(k.waktuPulangBaru),
    pegawai: absensi?.pegawai,
    absensi: absensi && barisRiwayat(absensi.jadwal, absensi),
  };
}

/**
 * POST /api/koreksi-absensi — tenaga medis mengajukan koreksi/banding absensinya.
 * body: { idJadwal, alasanKoreksi, waktuMasukBaru?, waktuPulangBaru?, berkasPendukung? }
 * Format waktu: 'YYYY-MM-DD HH:mm'. Bisa juga untuk jadwal yang tercatat "Tidak Hadir".
 */
export const ajukanKoreksi = asyncHandler(async (req, res) => {
  const { idJadwal, alasanKoreksi, waktuMasukBaru, waktuPulangBaru, berkasPendukung } = req.body || {};
  if (!idJadwal || !alasanKoreksi?.trim()) throw new ApiError(400, 'idJadwal dan alasanKoreksi wajib diisi');
  if (alasanKoreksi.length > 255) throw new ApiError(400, 'alasanKoreksi maksimal 255 karakter');
  if (berkasPendukung && String(berkasPendukung).length > 255) throw new ApiError(400, 'berkasPendukung maksimal 255 karakter');
  if (!waktuMasukBaru && !waktuPulangBaru) {
    throw new ApiError(400, 'Isi minimal waktuMasukBaru atau waktuPulangBaru');
  }

  const masuk = waktuMasukBaru ? parseWaktu(waktuMasukBaru) : null;
  const pulang = waktuPulangBaru ? parseWaktu(waktuPulangBaru) : null;
  if ((waktuMasukBaru && !masuk) || (waktuPulangBaru && !pulang)) {
    throw new ApiError(400, "Format waktu harus 'YYYY-MM-DD HH:mm'");
  }

  const jadwal = await prisma.jadwal.findFirst({
    where: { idJadwal, idPegawai: req.user.idPegawai },
    include: { absensi: { include: { pengajuan_koreksi: true } } },
  });
  if (!jadwal) throw new ApiError(404, 'Jadwal tidak ditemukan');

  const now = sekarang();
  if (batasJadwal(jadwal).mulai > now) throw new ApiError(400, 'Jadwal belum dimulai, belum bisa dikoreksi');
  if (masuk > now || pulang > now) throw new ApiError(400, 'Waktu koreksi tidak boleh di masa depan');

  let absensi = jadwal.absensi[0];
  if (absensi?.pengajuan_koreksi.some((k) => k.status === STATUS.MENUNGGU)) {
    throw new ApiError(409, 'Masih ada pengajuan koreksi yang menunggu untuk absensi ini');
  }

  // koreksi atas absen masuk yang belum ada wajib menyertakan waktu masuk
  if (!absensi?.waktuMasuk && !masuk) throw new ApiError(400, 'Anda belum absen masuk, waktuMasukBaru wajib diisi');
  validasiWaktuKoreksi(jadwal, masuk ?? absensi?.waktuMasuk, pulang ?? absensi?.waktuPulang);

  const data = await prisma.$transaction(async (tx) => {
    // jadwal yang terlewat ("Tidak Hadir") belum punya baris absensi -> buat dulu
    if (!absensi) {
      absensi = await tx.absensi.create({
        data: {
          idPegawai: jadwal.idPegawai,
          idJadwal: jadwal.idJadwal,
          tanggal: jadwal.tanggal,
          statusKehadiran: KEHADIRAN.TIDAK_HADIR,
        },
      });
    }
    return tx.pengajuan_koreksi.create({
      data: {
        idAbsensi: absensi.idAbsensi,
        waktuMasukBaru: masuk,
        waktuPulangBaru: pulang,
        alasanKoreksi: alasanKoreksi.trim(),
        berkasPendukung: berkasPendukung || null,
        status: STATUS.MENUNGGU,
      },
      include: includeDetail,
    });
  });

  res.status(201).json({ success: true, message: 'Pengajuan koreksi dikirim ke Sekretaris Unit', data: serializeKoreksi(data) });
});

/** GET /api/koreksi-absensi/saya?status= */
export const koreksiSaya = asyncHandler(async (req, res) => {
  const data = await prisma.pengajuan_koreksi.findMany({
    where: { absensi: { idPegawai: req.user.idPegawai }, ...(req.query.status && { status: req.query.status }) },
    include: includeDetail,
    orderBy: { idKoreksi: 'desc' },
  });
  res.json({ success: true, data: data.map(serializeKoreksi) });
});

/** GET /api/koreksi-absensi?status= — Sekretaris Unit (unitnya), HRD (semua, lihat saja). */
export const daftarKoreksi = asyncHandler(async (req, res) => {
  const scope = await scopePegawai(req.user);
  const data = await prisma.pengajuan_koreksi.findMany({
    where: { absensi: { pegawai: scope }, ...(req.query.status && { status: req.query.status }) },
    include: includeDetail,
    orderBy: { idKoreksi: 'desc' },
  });
  res.json({ success: true, data: data.map(serializeKoreksi) });
});

async function ambilKoreksiMenunggu(user, idKoreksi) {
  const scope = await scopePegawai(user);
  const k = await prisma.pengajuan_koreksi.findFirst({
    where: { idKoreksi, absensi: { pegawai: scope } },
    include: { absensi: { include: { jadwal: true } } },
  });
  if (!k) throw new ApiError(404, 'Pengajuan koreksi tidak ditemukan');
  if (k.status !== STATUS.MENUNGGU) throw new ApiError(400, `Pengajuan sudah berstatus ${k.status}`);
  return k;
}

/** PATCH /api/koreksi-absensi/:idKoreksi/setujui — body opsional: { catatan } */
export const setujuiKoreksi = asyncHandler(async (req, res) => {
  const k = await ambilKoreksiMenunggu(req.user, req.params.idKoreksi);
  const { absensi } = k;
  const { jadwal } = absensi;

  const waktuMasuk = k.waktuMasukBaru ?? absensi.waktuMasuk;
  const waktuPulang = k.waktuPulangBaru ?? absensi.waktuPulang;
  validasiWaktuKoreksi(jadwal, waktuMasuk, waktuPulang);

  const [data] = await prisma.$transaction([
    prisma.pengajuan_koreksi.update({
      where: { idKoreksi: k.idKoreksi },
      data: { status: STATUS.DISETUJUI, catatan: req.body?.catatan?.trim() || null },
      include: includeDetail,
    }),
    prisma.absensi.update({
      where: { idAbsensi: absensi.idAbsensi },
      data: {
        waktuMasuk,
        waktuPulang,
        statusKehadiran: waktuMasuk ? statusMasuk(jadwal, waktuMasuk) : KEHADIRAN.TIDAK_HADIR,
        statusPulang: waktuPulang ? statusPulang(jadwal, waktuPulang) : null,
      },
    }),
  ]);

  // ambil ulang supaya data absensi di respons sudah terbaru
  const fresh = await prisma.pengajuan_koreksi.findUnique({ where: { idKoreksi: data.idKoreksi }, include: includeDetail });
  res.json({ success: true, message: 'Koreksi disetujui, absensi diperbarui', data: serializeKoreksi(fresh) });
});

/** PATCH /api/koreksi-absensi/:idKoreksi/tolak — body: { catatan } (alasan penolakan) */
export const tolakKoreksi = asyncHandler(async (req, res) => {
  const catatan = req.body?.catatan?.trim();
  if (!catatan) throw new ApiError(400, 'catatan (alasan penolakan) wajib diisi');
  if (catatan.length > 255) throw new ApiError(400, 'catatan maksimal 255 karakter');

  const k = await ambilKoreksiMenunggu(req.user, req.params.idKoreksi);
  const data = await prisma.pengajuan_koreksi.update({
    where: { idKoreksi: k.idKoreksi },
    data: { status: STATUS.DITOLAK, catatan },
    include: includeDetail,
  });
  res.json({ success: true, message: 'Koreksi ditolak', data: serializeKoreksi(data) });
});

/** PATCH /api/koreksi-absensi/:idKoreksi/batal — pemilik membatalkan pengajuan yang masih menunggu. */
export const batalkanKoreksi = asyncHandler(async (req, res) => {
  const k = await prisma.pengajuan_koreksi.findFirst({
    where: { idKoreksi: req.params.idKoreksi, absensi: { idPegawai: req.user.idPegawai } },
  });
  if (!k) throw new ApiError(404, 'Pengajuan koreksi tidak ditemukan');
  if (k.status !== STATUS.MENUNGGU) throw new ApiError(400, `Pengajuan sudah berstatus ${k.status}`);

  const data = await prisma.pengajuan_koreksi.update({
    where: { idKoreksi: k.idKoreksi },
    data: { status: STATUS.DIBATALKAN },
    include: includeDetail,
  });
  res.json({ success: true, message: 'Pengajuan koreksi dibatalkan', data: serializeKoreksi(data) });
});

