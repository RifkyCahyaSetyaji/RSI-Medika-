import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';
import { hariIni, parseTanggal, sekarang, tambahHari } from '../utils/jadwal.js';
import { scopePegawai } from '../services/jadwal.service.js';
import {
  ATURAN_ABSEN,
  barisRiwayat,
  batasJadwal,
  cariAbsensiTerbuka,
  cariJadwalAktif,
  statusMasuk,
  statusPulang,
} from '../services/absensi.service.js';

const fmt = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

function ringkasJadwal(j) {
  const b = batasJadwal(j);
  return {
    idJadwal: j.idJadwal,
    jenisJadwal: j.jenisJadwal,
    mulai: fmt(b.mulai),
    selesai: fmt(b.selesai),
    jamMulai: fmt(b.mulai),
    jamSelesai: fmt(b.selesai),
    bukaAbsenMasuk: fmt(b.bukaMasuk),
  };
}

/** Rentang riwayat / rekap absensi. */
function rentangRiwayat(query = {}) {
  const now = sekarang();
  let d, s;

  if (query.periode && /^\d{4}-(0[1-9]|1[0-2])$/.test(query.periode)) {
    const [y, m] = query.periode.split('-').map(Number);
    d = new Date(Date.UTC(y, m - 1, 1));
    s = new Date(Date.UTC(y, m, 0));
  } else if (query.bulan && query.tahun) {
    const y = Number(query.tahun);
    const m = Number(query.bulan);
    d = new Date(Date.UTC(y, m - 1, 1));
    s = new Date(Date.UTC(y, m, 0));
  } else {
    const dari = query.dari || query.tanggalMulai;
    const sampai = query.sampai || query.tanggalSelesai;
    if (dari || sampai) {
      s = sampai ? parseTanggal(sampai) : hariIni();
      d = dari ? parseTanggal(dari) : tambahHari(s ?? hariIni(), -30);
      if (!d || !s) throw new ApiError(400, 'Parameter tanggal harus berformat YYYY-MM-DD');
      if (s < d) throw new ApiError(400, 'Tanggal akhir tidak boleh sebelum tanggal awal');
      if ((s - d) / 86400000 > 93) throw new ApiError(400, 'Rentang maksimal 93 hari');
    } else {
      // Default: bulan berjalan penuh (1 s/d akhir bulan)
      d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    }
  }

  return { gte: d, lte: s };
}

/**
 * GET /api/absensi/status — data panel absen (jam server + tombol masuk/pulang).
 */
export const statusAbsen = asyncHandler(async (req, res) => {
  const now = sekarang();
  const [aktif, terbuka, berikut] = await Promise.all([
    cariJadwalAktif(req.user.idPegawai, now),
    cariAbsensiTerbuka(req.user.idPegawai, now),
    prisma.jadwal.findFirst({
      where: { idPegawai: req.user.idPegawai, tanggal: { gte: hariIni() }, absensi: { none: {} } },
      orderBy: [{ tanggal: 'asc' }, { jamMulai: 'asc' }],
    }),
  ]);

  res.json({
    success: true,
    data: {
      waktuServer: fmt(now),
      aturan: ATURAN_ABSEN,
      bisaAbsenMasuk: aktif.length > 0 && terbuka.length === 0,
      bisaAbsenPulang: terbuka.length > 0,
      jadwalAktif: aktif.map(ringkasJadwal),
      absensiBerjalan: terbuka.map((a) => barisRiwayat(a.jadwal, a, now)),
      jadwalBerikutnya: berikut && ringkasJadwal(berikut),
    },
  });
});

/**
 * POST /api/absensi/masuk — body opsional: { idJadwal }
 * Lembur = jadwal tersendiri, jadi absen masuk lagi saat jadwal lemburnya mulai.
 */
export const absenMasuk = asyncHandler(async (req, res) => {
  const now = sekarang();
  const terbuka = await cariAbsensiTerbuka(req.user.idPegawai, now);
  if (terbuka.length > 0) {
    throw new ApiError(409, `Anda belum absen pulang untuk ${terbuka[0].jadwal.jenisJadwal}. Absen pulang terlebih dahulu.`);
  }

  const aktif = await cariJadwalAktif(req.user.idPegawai, now);
  if (aktif.length === 0) {
    throw new ApiError(
      400,
      `Tidak ada jadwal yang bisa diabsen sekarang. Absen masuk dibuka ${ATURAN_ABSEN.bukaSebelumMenit} menit sebelum jadwal dimulai.`,
    );
  }

  const { idJadwal } = req.body || {};
  const jadwal = idJadwal ? aktif.find((j) => j.idJadwal === idJadwal) : aktif[0];
  if (!jadwal) throw new ApiError(400, 'Jadwal tersebut tidak sedang dalam waktu absen');

  const absensi = await prisma.absensi.create({
    data: {
      idPegawai: req.user.idPegawai,
      idJadwal: jadwal.idJadwal,
      tanggal: jadwal.tanggal,
      waktuMasuk: now,
      statusKehadiran: statusMasuk(jadwal, now),
    },
  });

  const data = barisRiwayat(jadwal, absensi, now);
  res.status(201).json({
    success: true,
    message: data.statusKehadiran === 'Terlambat'
      ? `Absen masuk tercatat, Anda terlambat ${data.menitTerlambat} menit`
      : 'Absen masuk berhasil dicatat',
    data,
  });
});

/** POST /api/absensi/pulang — body opsional: { idAbsensi } */
export const absenPulang = asyncHandler(async (req, res) => {
  const now = sekarang();
  const terbuka = await cariAbsensiTerbuka(req.user.idPegawai, now);
  if (terbuka.length === 0) throw new ApiError(400, 'Tidak ada absensi masuk yang perlu diabsen pulang');

  const { idAbsensi } = req.body || {};
  const target = idAbsensi ? terbuka.find((a) => a.idAbsensi === idAbsensi) : terbuka[0];
  if (!target) throw new ApiError(404, 'Absensi tidak ditemukan atau sudah melewati batas absen pulang');

  const updated = await prisma.absensi.update({
    where: { idAbsensi: target.idAbsensi },
    data: { waktuPulang: now, statusPulang: statusPulang(target.jadwal, now) },
  });

  const data = barisRiwayat(target.jadwal, updated, now);
  res.json({
    success: true,
    message: data.statusPulang === 'Pulang Cepat'
      ? 'Absen pulang tercatat (pulang sebelum jadwal selesai)'
      : 'Absen pulang berhasil dicatat. Selamat beristirahat!',
    data,
  });
});

async function riwayat(wherePegawai, query) {
  const tanggal = rentangRiwayat(query);
  const jadwal = await prisma.jadwal.findMany({
    where: { ...wherePegawai, tanggal },
    include: {
      absensi: true,
      pegawai: { select: { idPegawai: true, nama: true, nip: true, jabatan: true, unitKerja: true } },
    },
    orderBy: [{ tanggal: 'desc' }, { jamMulai: 'desc' }],
  });
  const now = sekarang();
  let rows = jadwal
    // Jadwal yang sudah memiliki data absensi di DB selalu ditampilkan;
    // jadwal tanpa absensi hanya ditampilkan jika waktu buka absennya sudah lewat
    .filter((j) => (j.absensi && j.absensi.length > 0) || batasJadwal(j).bukaMasuk <= now)
    .map((j) => ({ ...barisRiwayat(j, j.absensi[0], now), pegawai: j.pegawai }));
  if (query.status) rows = rows.filter((r) => r.status === query.status || r.statusKehadiran === query.status);
  return rows;
}

/** GET /api/absensi/riwayat?dari=&sampai=&status= — riwayat milik sendiri. */
export const riwayatSaya = asyncHandler(async (req, res) => {
  const data = await riwayat({ idPegawai: req.user.idPegawai }, req.query);
  res.json({ success: true, data });
});

/** GET /api/absensi/riwayat/:idJadwal — detail satu baris riwayat + koreksinya. */
export const detailRiwayat = asyncHandler(async (req, res) => {
  const where = { idJadwal: req.params.idJadwal };
  if (![ROLES.HRD, ROLES.SEKRETARIS_UNIT].includes(req.user.role)) where.idPegawai = req.user.idPegawai;
  else where.pegawai = await scopePegawai(req.user);

  const jadwal = await prisma.jadwal.findFirst({
    where,
    include: {
      absensi: { include: { pengajuan_koreksi: { orderBy: { idKoreksi: 'desc' } } } },
      pegawai: { select: { idPegawai: true, nama: true, nip: true, jabatan: true, unitKerja: true } },
    },
  });
  if (!jadwal) throw new ApiError(404, 'Data absensi tidak ditemukan');

  const absensi = jadwal.absensi[0];
  const now = sekarang();
  res.json({
    success: true,
    data: {
      ...barisRiwayat(jadwal, absensi, now),
      pegawai: jadwal.pegawai,
      bisaAjukanKoreksi: batasJadwal(jadwal).mulai <= now &&
        !(absensi?.pengajuan_koreksi ?? []).some((k) => k.status === 'Menunggu'),
      koreksi: (absensi?.pengajuan_koreksi ?? []).map((k) => ({
        ...k,
        waktuMasukBaru: k.waktuMasukBaru && fmt(k.waktuMasukBaru),
        waktuPulangBaru: k.waktuPulangBaru && fmt(k.waktuPulangBaru),
      })),
    },
  });
});

/** GET /api/absensi/rekap?dari=&sampai=&idPegawai=&status= — HRD semua, Sekretaris Unit unitnya. */
export const rekapAbsensi = asyncHandler(async (req, res) => {
  const scope = await scopePegawai(req.user);
  const data = await riwayat(
    { pegawai: scope, ...(req.query.idPegawai && { idPegawai: req.query.idPegawai }) },
    req.query,
  );
  res.json({ success: true, data });
});
