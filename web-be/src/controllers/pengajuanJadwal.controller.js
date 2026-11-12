import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import {
  JENIS_PRAKTIK,
  formatJam,
  formatTanggal,
  isLembur,
  isSpesialis,
  jenisLembur,
  parseTanggal,
  shiftDariJam,
} from '../utils/jadwal.js';
import {
  pastikanJadwalBisaDiubah,
  pastikanTidakAdaLemburTergantung,
  scopePegawai,
  tentukanSlot,
  validasiJadwal,
} from '../services/jadwal.service.js';

export const STATUS = Object.freeze({
  MENUNGGU: 'Menunggu',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
  DIBATALKAN: 'Dibatalkan',
});

const JENIS_PENGAJUAN = 'Perubahan Jadwal';

const includeDetail = {
  jadwal: true,
  pegawai: {
    select: { nama: true, unitKerja: true, peran_tenaga_medis: { select: { namaPeran: true } } },
  },
};

function serializePengajuan(p) {
  const { jadwal, ...rest } = p;
  return {
    ...rest,
    tanggalBaru: p.tanggalBaru && formatTanggal(p.tanggalBaru),
    jamMulaiBaru: p.jamMulaiBaru && formatJam(p.jamMulaiBaru),
    jamSelesaiBaru: p.jamSelesaiBaru && formatJam(p.jamSelesaiBaru),
    jadwalLama: jadwal && {
      idJadwal: jadwal.idJadwal,
      tanggal: formatTanggal(jadwal.tanggal),
      jamMulai: formatJam(jadwal.jamMulai),
      jamSelesai: formatJam(jadwal.jamSelesai),
      jenisJadwal: jadwal.jenisJadwal,
    },
  };
}

/** Hitung slot baru dari pengajuan (field yang kosong = tetap seperti jadwal lama). */
function slotBaru(pegawai, jadwal, { tanggalBaru, jamMulaiBaru, jamSelesaiBaru }) {
  const tanggal = tanggalBaru ?? jadwal.tanggal;
  if (!jamMulaiBaru && !jamSelesaiBaru) {
    return { tanggal, jenisJadwal: jadwal.jenisJadwal, jamMulai: jadwal.jamMulai, jamSelesai: jadwal.jamSelesai };
  }
  const jamMulai = jamMulaiBaru ?? jadwal.jamMulai;
  const jamSelesai = jamSelesaiBaru ?? jadwal.jamSelesai;
  let jenisJadwal = JENIS_PRAKTIK;
  if (!isSpesialis(pegawai)) {
    const shift = shiftDariJam(jamMulai, jamSelesai);
    // status lembur ikut jadwal lama
    jenisJadwal = shift
      ? (isLembur(jadwal.jenisJadwal) ? jenisLembur(shift.jenisJadwal) : shift.jenisJadwal)
      : jadwal.jenisJadwal;
  }
  return { tanggal, jenisJadwal, jamMulai, jamSelesai };
}

/**
 * POST /api/pengajuan-jadwal — pegawai mengajukan perubahan jadwalnya sendiri.
 * body: { idJadwal, alasan, tanggalBaru?, shiftBaru? (non spesialis), jamMulaiBaru?, jamSelesaiBaru? (spesialis) }
 */
export const ajukan = asyncHandler(async (req, res) => {
  const { idJadwal, alasan, tanggalBaru, shiftBaru, jamMulaiBaru, jamSelesaiBaru } = req.body || {};
  if (!idJadwal || !alasan?.trim()) throw new ApiError(400, 'idJadwal dan alasan wajib diisi');
  if (alasan.length > 255) throw new ApiError(400, 'Alasan maksimal 255 karakter');
  if (!tanggalBaru && !shiftBaru && !jamMulaiBaru && !jamSelesaiBaru) {
    throw new ApiError(400, 'Isi minimal satu perubahan: tanggalBaru, shiftBaru, atau jam baru');
  }

  const jadwal = await prisma.jadwal.findFirst({
    where: { idJadwal, idPegawai: req.user.idPegawai },
    include: { pegawai: { include: { peran_tenaga_medis: true } } },
  });
  if (!jadwal) throw new ApiError(404, 'Jadwal tidak ditemukan');
  await pastikanJadwalBisaDiubah(jadwal);

  const pending = await prisma.pengajuan_jadwal.count({ where: { idJadwal, status: STATUS.MENUNGGU } });
  if (pending > 0) throw new ApiError(409, 'Jadwal ini masih memiliki pengajuan yang menunggu persetujuan');

  const pegawai = jadwal.pegawai;
  let tgl = null;
  if (tanggalBaru) {
    tgl = parseTanggal(tanggalBaru);
    if (!tgl) throw new ApiError(400, 'tanggalBaru harus berformat YYYY-MM-DD');
  }

  // Non spesialis pindah shift lewat shiftBaru; spesialis lewat jamMulaiBaru/jamSelesaiBaru
  let jam = {};
  if (shiftBaru || jamMulaiBaru || jamSelesaiBaru) {
    const s = tentukanSlot(pegawai, {
      shift: shiftBaru,
      jamMulai: jamMulaiBaru ?? formatJam(jadwal.jamMulai),
      jamSelesai: jamSelesaiBaru ?? formatJam(jadwal.jamSelesai),
    });
    jam = { jamMulaiBaru: s.jamMulai, jamSelesaiBaru: s.jamSelesai };
  }

  // Cek dari awal supaya pegawai tahu kalau slot barunya bentrok
  if (tgl && tgl.getTime() !== jadwal.tanggal.getTime()) await pastikanTidakAdaLemburTergantung(jadwal);
  await validasiJadwal(pegawai, slotBaru(pegawai, jadwal, { tanggalBaru: tgl, ...jam }), {
    kecualiIdJadwal: jadwal.idJadwal,
  });

  const data = await prisma.pengajuan_jadwal.create({
    data: {
      idPegawai: pegawai.idPegawai,
      idJadwal,
      jenisPengajuan: JENIS_PENGAJUAN,
      tanggalBaru: tgl,
      ...jam,
      alasan: alasan.trim(),
      status: STATUS.MENUNGGU,
      sisaJatahCuti: pegawai.sisaJatahCuti,
    },
    include: includeDetail,
  });
  res.status(201).json({ success: true, data: serializePengajuan(data) });
});

/** GET /api/pengajuan-jadwal/saya — riwayat pengajuan milik user. */
export const pengajuanSaya = asyncHandler(async (req, res) => {
  const data = await prisma.pengajuan_jadwal.findMany({
    where: { idPegawai: req.user.idPegawai },
    include: includeDetail,
    orderBy: { idPengajuan: 'desc' },
  });
  res.json({ success: true, data: data.map(serializePengajuan) });
});

/** GET /api/pengajuan-jadwal?status= — Sekretaris Unit (unitnya) / HRD (semua, lihat saja). */
export const daftarPengajuan = asyncHandler(async (req, res) => {
  const scope = await scopePegawai(req.user);
  const data = await prisma.pengajuan_jadwal.findMany({
    where: { pegawai: scope, ...(req.query.status && { status: req.query.status }) },
    include: includeDetail,
    orderBy: { idPengajuan: 'desc' },
  });
  res.json({ success: true, data: data.map(serializePengajuan) });
});

async function ambilPengajuanMenunggu(user, idPengajuan) {
  const scope = await scopePegawai(user);
  const p = await prisma.pengajuan_jadwal.findFirst({
    where: { idPengajuan, pegawai: scope },
    include: { jadwal: true, pegawai: { include: { peran_tenaga_medis: true } } },
  });
  if (!p) throw new ApiError(404, 'Pengajuan tidak ditemukan');
  if (p.status !== STATUS.MENUNGGU) throw new ApiError(400, `Pengajuan sudah berstatus ${p.status}`);
  return p;
}

/** PATCH /api/pengajuan-jadwal/:id/setujui — Sekretaris Unit; jadwal langsung diperbarui. */
export const setujui = asyncHandler(async (req, res) => {
  const p = await ambilPengajuanMenunggu(req.user, req.params.idPengajuan);
  await pastikanJadwalBisaDiubah(p.jadwal);

  // Validasi ulang karena kondisi bisa berubah sejak pengajuan dibuat
  const slot = slotBaru(p.pegawai, p.jadwal, p);
  if (slot.tanggal.getTime() !== p.jadwal.tanggal.getTime()) {
    await pastikanTidakAdaLemburTergantung(p.jadwal);
  }
  await validasiJadwal(p.pegawai, slot, { kecualiIdJadwal: p.idJadwal });

  const [data] = await prisma.$transaction([
    prisma.pengajuan_jadwal.update({
      where: { idPengajuan: p.idPengajuan },
      data: { status: STATUS.DISETUJUI },
      include: includeDetail,
    }),
    prisma.jadwal.update({ where: { idJadwal: p.idJadwal }, data: slot }),
  ]);
  res.json({ success: true, message: 'Pengajuan disetujui, jadwal diperbarui', data: serializePengajuan(data) });
});

/** PATCH /api/pengajuan-jadwal/:id/tolak — body: { alasanPenolakan } */
export const tolak = asyncHandler(async (req, res) => {
  const { alasanPenolakan } = req.body || {};
  if (!alasanPenolakan?.trim()) throw new ApiError(400, 'alasanPenolakan wajib diisi');
  if (alasanPenolakan.length > 255) throw new ApiError(400, 'alasanPenolakan maksimal 255 karakter');

  const p = await ambilPengajuanMenunggu(req.user, req.params.idPengajuan);
  const data = await prisma.pengajuan_jadwal.update({
    where: { idPengajuan: p.idPengajuan },
    data: { status: STATUS.DITOLAK, alasanPenolakan: alasanPenolakan.trim() },
    include: includeDetail,
  });
  res.json({ success: true, message: 'Pengajuan ditolak', data: serializePengajuan(data) });
});

/** PATCH /api/pengajuan-jadwal/:id/batal — pemilik membatalkan pengajuan yang masih menunggu. */
export const batalkan = asyncHandler(async (req, res) => {
  const p = await prisma.pengajuan_jadwal.findFirst({
    where: { idPengajuan: req.params.idPengajuan, idPegawai: req.user.idPegawai },
  });
  if (!p) throw new ApiError(404, 'Pengajuan tidak ditemukan');
  if (p.status !== STATUS.MENUNGGU) throw new ApiError(400, `Pengajuan sudah berstatus ${p.status}`);

  const data = await prisma.pengajuan_jadwal.update({
    where: { idPengajuan: p.idPengajuan },
    data: { status: STATUS.DIBATALKAN },
    include: includeDetail,
  });
  res.json({ success: true, message: 'Pengajuan dibatalkan', data: serializePengajuan(data) });
});
