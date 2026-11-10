import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { formatTanggal, hariIni, parseTanggal } from '../utils/jadwal.js';
import { scopePegawai } from '../services/jadwal.service.js';
import { KEHADIRAN } from '../services/absensi.service.js';
import {
  JENIS_CUTI,
  STATUS,
  cekKuota,
  daftarTanggal,
  jumlahHari,
  nomorSuratBaru,
  notifikasiCuti,
  pakaiKuota,
  tandaiAbsensi,
  validasiPengajuanDasar,
} from '../services/cuti.service.js';

const includeDetail = {
  pegawai: { select: { idPegawai: true, nama: true, unitKerja: true, sisaJatahCuti: true } },
  surat_hasil_cuti: true,
};

function serialize(p) {
  return {
    ...p,
    tanggalMulai: formatTanggal(p.tanggalMulai),
    tanggalSelesai: formatTanggal(p.tanggalSelesai),
    surat_hasil_cuti: p.surat_hasil_cuti && {
      ...p.surat_hasil_cuti,
      tanggalTerbit: formatTanggal(p.surat_hasil_cuti.tanggalTerbit),
    },
  };
}

/** GET /api/cuti/jenis — daftar jenis cuti + sisa jatah user. */
export const jenisCuti = asyncHandler(async (req, res) => {
  const pegawai = await prisma.pegawai.findUnique({
    where: { idPegawai: req.user.idPegawai },
    select: { sisaJatahCuti: true },
  });
  res.json({ success: true, data: { jenis: JENIS_CUTI, sisaJatahCuti: pegawai?.sisaJatahCuti ?? 0 } });
});

/**
 * POST /api/cuti — body: { jenisCuti, tanggalMulai, tanggalSelesai, alasan }
 * Cuti diajukan paling cepat untuk besok (H+1).
 */
export const ajukanCuti = asyncHandler(async (req, res) => {
  const { jenisCuti, tanggalMulai, tanggalSelesai, alasan } = req.body || {};
  const aturan = JENIS_CUTI[jenisCuti];
  if (!aturan) throw new ApiError(400, `jenisCuti harus salah satu dari: ${Object.keys(JENIS_CUTI).join(', ')}`);
  if (!alasan?.trim()) throw new ApiError(400, 'alasan wajib diisi');
  if (alasan.length > 255) throw new ApiError(400, 'alasan maksimal 255 karakter');

  const mulai = parseTanggal(tanggalMulai);
  const selesai = parseTanggal(tanggalSelesai);
  if (!mulai || !selesai) throw new ApiError(400, 'Tanggal harus berformat YYYY-MM-DD');
  if (selesai < mulai) throw new ApiError(400, 'Tanggal selesai tidak boleh sebelum tanggal mulai');
  if (mulai <= hariIni()) throw new ApiError(400, 'Cuti diajukan paling cepat untuk besok');

  const durasi = jumlahHari(mulai, selesai);
  if (durasi > aturan.maksHari) throw new ApiError(400, `${jenisCuti} maksimal ${aturan.maksHari} hari`);

  const pegawai = await prisma.pegawai.findUnique({ where: { idPegawai: req.user.idPegawai } });
  if (!pegawai) throw new ApiError(404, 'Data pegawai tidak ditemukan');
  if (aturan.potongJatah && durasi > pegawai.sisaJatahCuti) {
    throw new ApiError(400, `Sisa jatah cuti Anda ${pegawai.sisaJatahCuti} hari, tidak cukup untuk ${durasi} hari`);
  }
  await validasiPengajuanDasar(pegawai, mulai, selesai);
  await cekKuota(prisma, daftarTanggal(mulai, selesai));

  const data = await prisma.pengajuan_cuti.create({
    data: {
      idPegawai: pegawai.idPegawai,
      tanggalMulai: mulai,
      tanggalSelesai: selesai,
      durasi,
      jenisCuti,
      alasan: alasan.trim(),
      status: STATUS.MENUNGGU,
    },
    include: includeDetail,
  });
  res.status(201).json({ success: true, message: 'Pengajuan cuti dikirim ke Sekretaris Unit', data: serialize(data) });
});

/** GET /api/cuti/saya?status= */
export const cutiSaya = asyncHandler(async (req, res) => {
  const data = await prisma.pengajuan_cuti.findMany({
    where: { idPegawai: req.user.idPegawai, ...(req.query.status && { status: req.query.status }) },
    include: includeDetail,
    orderBy: { idPengajuan: 'desc' },
  });
  res.json({ success: true, data: data.map(serialize) });
});

/** GET /api/cuti?status= — Sekretaris Unit (unitnya), HRD (semua, lihat saja). */
export const daftarCuti = asyncHandler(async (req, res) => {
  const scope = await scopePegawai(req.user);
  const data = await prisma.pengajuan_cuti.findMany({
    where: { pegawai: scope, ...(req.query.status && { status: req.query.status }) },
    include: includeDetail,
    orderBy: { idPengajuan: 'desc' },
  });
  res.json({ success: true, data: data.map(serialize) });
});

/** GET /api/cuti/:idPengajuan — detail (pemilik, Sekretaris Unit, HRD). */
export const detailCuti = asyncHandler(async (req, res) => {
  const where = { idPengajuan: req.params.idPengajuan };
  const pengelola = ['HRD', 'Sekretaris Unit'].includes(req.user.role);
  if (pengelola) where.pegawai = await scopePegawai(req.user);
  else where.idPegawai = req.user.idPegawai;

  const data = await prisma.pengajuan_cuti.findFirst({ where, include: includeDetail });
  if (!data) throw new ApiError(404, 'Pengajuan cuti tidak ditemukan');
  res.json({ success: true, data: serialize(data) });
});

async function ambilMenunggu(user, idPengajuan) {
  const scope = await scopePegawai(user);
  const p = await prisma.pengajuan_cuti.findFirst({
    where: { idPengajuan, pegawai: scope },
    include: { pegawai: true },
  });
  if (!p) throw new ApiError(404, 'Pengajuan cuti tidak ditemukan');
  if (p.status !== STATUS.MENUNGGU) throw new ApiError(400, `Pengajuan sudah berstatus ${p.status}`);
  return p;
}

/**
 * PATCH /api/cuti/:idPengajuan/setujui — body opsional: { catatan }
 * Efek: potong jatah (Cuti Tahunan), pakai kuota per tanggal, tandai jadwal sebagai Cuti,
 * terbitkan surat hasil cuti, dan kirim notifikasi.
 */
export const setujuiCuti = asyncHandler(async (req, res) => {
  const p = await ambilMenunggu(req.user, req.params.idPengajuan);
  const aturan = JENIS_CUTI[p.jenisCuti];
  const catatan = req.body?.catatan?.trim() || null;

  const data = await prisma.$transaction(async (tx) => {
    if (aturan?.potongJatah) {
      // updateMany dengan syarat sisa cukup -> aman dari race condition
      const r = await tx.pegawai.updateMany({
        where: { idPegawai: p.idPegawai, sisaJatahCuti: { gte: p.durasi } },
        data: { sisaJatahCuti: { decrement: p.durasi } },
      });
      if (r.count === 0) throw new ApiError(400, 'Sisa jatah cuti pegawai tidak mencukupi');
    }
    await pakaiKuota(tx, daftarTanggal(p.tanggalMulai, p.tanggalSelesai));
    await tandaiAbsensi(tx, p.idPegawai, p.tanggalMulai, p.tanggalSelesai, KEHADIRAN.CUTI);

    await tx.surat_hasil_cuti.create({
      data: {
        idPengajuan: p.idPengajuan,
        nomorSurat: await nomorSuratBaru(tx),
        tanggalTerbit: hariIni(),
        keputusan: STATUS.DISETUJUI,
      },
    });
    await notifikasiCuti(
      tx,
      p.idPegawai,
      p.idPengajuan,
      `Pengajuan ${p.jenisCuti} Anda (${formatTanggal(p.tanggalMulai)} s/d ${formatTanggal(p.tanggalSelesai)}) disetujui`,
    );
    return tx.pengajuan_cuti.update({
      where: { idPengajuan: p.idPengajuan },
      data: { status: STATUS.DISETUJUI, keputusan: STATUS.DISETUJUI, catatan },
      include: includeDetail,
    });
  });

  res.json({ success: true, message: 'Pengajuan cuti disetujui', data: serialize(data) });
});

/** PATCH /api/cuti/:idPengajuan/tolak — body: { catatan } */
export const tolakCuti = asyncHandler(async (req, res) => {
  const catatan = req.body?.catatan?.trim();
  if (!catatan) throw new ApiError(400, 'catatan (alasan penolakan) wajib diisi');
  if (catatan.length > 255) throw new ApiError(400, 'catatan maksimal 255 karakter');

  const p = await ambilMenunggu(req.user, req.params.idPengajuan);
  const data = await prisma.$transaction(async (tx) => {
    await tx.surat_hasil_cuti.create({
      data: {
        idPengajuan: p.idPengajuan,
        nomorSurat: await nomorSuratBaru(tx),
        tanggalTerbit: hariIni(),
        keputusan: STATUS.DITOLAK,
      },
    });
    await notifikasiCuti(tx, p.idPegawai, p.idPengajuan, `Pengajuan ${p.jenisCuti} Anda ditolak: ${catatan}`);
    return tx.pengajuan_cuti.update({
      where: { idPengajuan: p.idPengajuan },
      data: { status: STATUS.DITOLAK, keputusan: STATUS.DITOLAK, catatan },
      include: includeDetail,
    });
  });
  res.json({ success: true, message: 'Pengajuan cuti ditolak', data: serialize(data) });
});

/** PATCH /api/cuti/:idPengajuan/batal — pemilik membatalkan pengajuan yang masih menunggu. */
export const batalkanCuti = asyncHandler(async (req, res) => {
  const p = await prisma.pengajuan_cuti.findFirst({
    where: { idPengajuan: req.params.idPengajuan, idPegawai: req.user.idPegawai },
  });
  if (!p) throw new ApiError(404, 'Pengajuan cuti tidak ditemukan');
  if (p.status !== STATUS.MENUNGGU) throw new ApiError(400, `Pengajuan sudah berstatus ${p.status}`);

  const data = await prisma.pengajuan_cuti.update({
    where: { idPengajuan: p.idPengajuan },
    data: { status: STATUS.DIBATALKAN },
    include: includeDetail,
  });
  res.json({ success: true, message: 'Pengajuan cuti dibatalkan', data: serialize(data) });
});

/** GET /api/cuti/notifikasi — daftar notifikasi cuti milik user yang login. */
export const notifikasiSaya = asyncHandler(async (req, res) => {
  const data = await prisma.notifikasi.findMany({
    where: { idAkun: req.user.idAkun },
    orderBy: { tanggalKirim: 'desc' },
  });
  res.json({ success: true, data });
});

