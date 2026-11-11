import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { formatTanggal, hariIni, parseTanggal, tambahHari } from '../utils/jadwal.js';
import { scopePegawai } from '../services/jadwal.service.js';
import {
  JENIS_IZIN,
  STATUS,
  jumlahHari,
  tandaiAbsensi,
  validasiPengajuanDasar,
} from '../services/cuti.service.js';

const includeDetail = {
  pegawai: { select: { idPegawai: true, nama: true, unitKerja: true } },
};

const serialize = (p) => ({
  ...p,
  durasi: jumlahHari(p.tanggalMulai, p.tanggalSelesai),
  tanggalMulai: formatTanggal(p.tanggalMulai),
  tanggalSelesai: formatTanggal(p.tanggalSelesai),
});

/** GET /api/izin/jenis */
export const jenisIzin = (req, res) => res.json({ success: true, data: JENIS_IZIN });

/**
 * POST /api/izin — body: { jenis: 'Izin' | 'Sakit', tanggalMulai, tanggalSelesai, alasan, berkasPendukung? }
 * Izin: mulai hari ini atau ke depan. Sakit: boleh mundur maks 3 hari & wajib berkas (surat dokter).
 * Tidak memotong jatah cuti.
 */
export const ajukanIzin = asyncHandler(async (req, res) => {
  const { jenis, tanggalMulai, tanggalSelesai, alasan, berkasPendukung } = req.body || {};
  const aturan = JENIS_IZIN[jenis];
  if (!aturan) throw new ApiError(400, `jenis harus salah satu dari: ${Object.keys(JENIS_IZIN).join(', ')}`);
  if (!alasan?.trim()) throw new ApiError(400, 'alasan wajib diisi');
  if (alasan.length > 255) throw new ApiError(400, 'alasan maksimal 255 karakter');
  if (aturan.wajibBerkas && !berkasPendukung) throw new ApiError(400, `${jenis} wajib melampirkan berkas pendukung`);
  if (berkasPendukung && String(berkasPendukung).length > 255) throw new ApiError(400, 'berkasPendukung maksimal 255 karakter');

  const mulai = parseTanggal(tanggalMulai);
  const selesai = parseTanggal(tanggalSelesai ?? tanggalMulai);
  if (!mulai || !selesai) throw new ApiError(400, 'Tanggal harus berformat YYYY-MM-DD');
  if (selesai < mulai) throw new ApiError(400, 'Tanggal selesai tidak boleh sebelum tanggal mulai');
  if (mulai < tambahHari(hariIni(), -aturan.bolehMundurHari)) {
    throw new ApiError(
      400,
      aturan.bolehMundurHari
        ? `${jenis} hanya boleh diajukan mundur maksimal ${aturan.bolehMundurHari} hari`
        : `${jenis} tidak bisa diajukan untuk tanggal yang sudah lewat`,
    );
  }
  if (jumlahHari(mulai, selesai) > aturan.maksHari) throw new ApiError(400, `${jenis} maksimal ${aturan.maksHari} hari`);

  const pegawai = await prisma.pegawai.findUnique({ where: { idPegawai: req.user.idPegawai } });
  if (!pegawai) throw new ApiError(404, 'Data pegawai tidak ditemukan');
  await validasiPengajuanDasar(pegawai, mulai, selesai);

  const data = await prisma.pengajuan_ketidakhadiran.create({
    data: {
      idPegawai: pegawai.idPegawai,
      tanggalMulai: mulai,
      tanggalSelesai: selesai,
      jenis,
      alasan: alasan.trim(),
      berkasPendukung: berkasPendukung || null,
      status: STATUS.MENUNGGU,
    },
    include: includeDetail,
  });
  res.status(201).json({ success: true, message: `Pengajuan ${jenis.toLowerCase()} dikirim ke Sekretaris Unit`, data: serialize(data) });
});

/** GET /api/izin/saya?status= */
export const izinSaya = asyncHandler(async (req, res) => {
  const data = await prisma.pengajuan_ketidakhadiran.findMany({
    where: { idPegawai: req.user.idPegawai, ...(req.query.status && { status: req.query.status }) },
    include: includeDetail,
    orderBy: { idPengajuan: 'desc' },
  });
  res.json({ success: true, data: data.map(serialize) });
});

/** GET /api/izin?status= — Sekretaris Unit (unitnya), HRD (semua, lihat saja). */
export const daftarIzin = asyncHandler(async (req, res) => {
  const scope = await scopePegawai(req.user);
  const data = await prisma.pengajuan_ketidakhadiran.findMany({
    where: { pegawai: scope, ...(req.query.status && { status: req.query.status }) },
    include: includeDetail,
    orderBy: { idPengajuan: 'desc' },
  });
  res.json({ success: true, data: data.map(serialize) });
});

async function ambilMenunggu(user, idPengajuan) {
  const scope = await scopePegawai(user);
  const p = await prisma.pengajuan_ketidakhadiran.findFirst({ where: { idPengajuan, pegawai: scope } });
  if (!p) throw new ApiError(404, 'Pengajuan tidak ditemukan');
  if (p.status !== STATUS.MENUNGGU) throw new ApiError(400, `Pengajuan sudah berstatus ${p.status}`);
  return p;
}

/** PATCH /api/izin/:idPengajuan/setujui — body opsional: { catatan }. Jadwal di rentang ditandai Izin/Sakit. */
export const setujuiIzin = asyncHandler(async (req, res) => {
  const p = await ambilMenunggu(req.user, req.params.idPengajuan);
  const data = await prisma.$transaction(async (tx) => {
    await tandaiAbsensi(tx, p.idPegawai, p.tanggalMulai, p.tanggalSelesai, JENIS_IZIN[p.jenis]?.status ?? p.jenis);
    return tx.pengajuan_ketidakhadiran.update({
      where: { idPengajuan: p.idPengajuan },
      data: { status: STATUS.DISETUJUI, catatan: req.body?.catatan?.trim() || null },
      include: includeDetail,
    });
  });
  res.json({ success: true, message: `Pengajuan ${p.jenis.toLowerCase()} disetujui`, data: serialize(data) });
});

/** PATCH /api/izin/:idPengajuan/tolak — body: { catatan } */
export const tolakIzin = asyncHandler(async (req, res) => {
  const catatan = req.body?.catatan?.trim();
  if (!catatan) throw new ApiError(400, 'catatan (alasan penolakan) wajib diisi');
  if (catatan.length > 255) throw new ApiError(400, 'catatan maksimal 255 karakter');

  const p = await ambilMenunggu(req.user, req.params.idPengajuan);
  const data = await prisma.pengajuan_ketidakhadiran.update({
    where: { idPengajuan: p.idPengajuan },
    data: { status: STATUS.DITOLAK, catatan },
    include: includeDetail,
  });
  res.json({ success: true, message: `Pengajuan ${p.jenis.toLowerCase()} ditolak`, data: serialize(data) });
});

/** PATCH /api/izin/:idPengajuan/batal */
export const batalkanIzin = asyncHandler(async (req, res) => {
  const p = await prisma.pengajuan_ketidakhadiran.findFirst({
    where: { idPengajuan: req.params.idPengajuan, idPegawai: req.user.idPegawai },
  });
  if (!p) throw new ApiError(404, 'Pengajuan tidak ditemukan');
  if (p.status !== STATUS.MENUNGGU) throw new ApiError(400, `Pengajuan sudah berstatus ${p.status}`);

  const data = await prisma.pengajuan_ketidakhadiran.update({
    where: { idPengajuan: p.idPengajuan },
    data: { status: STATUS.DIBATALKAN },
    include: includeDetail,
  });
  res.json({ success: true, message: 'Pengajuan dibatalkan', data: serialize(data) });
});

