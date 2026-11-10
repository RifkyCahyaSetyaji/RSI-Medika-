import 'dotenv/config';

import prisma from '../config/prisma.js';
import { ApiError } from '../utils/http.js';
import {
  formatJam,
  formatTanggal,
  intervalJadwal,
  isLembur,
  sekarang,
  tambahHari,
} from '../utils/jadwal.js';

/** Aturan absensi (bisa diatur lewat .env). */
export const ATURAN_ABSEN = Object.freeze({
  bukaSebelumMenit: Number(process.env.ABSEN_BUKA_MENIT ?? 60),
  toleransiTerlambatMenit: Number(process.env.ABSEN_TOLERANSI_MENIT ?? 0),
  batasPulangSetelahMenit: Number(process.env.ABSEN_BATAS_PULANG_MENIT ?? 240),
});

export const KEHADIRAN = Object.freeze({
  HADIR: 'Hadir',
  TERLAMBAT: 'Terlambat',
  TIDAK_HADIR: 'Tidak Hadir',
});

export const PULANG = Object.freeze({
  TEPAT_WAKTU: 'Tepat Waktu',
  PULANG_CEPAT: 'Pulang Cepat',
  BELUM: 'Belum Absensi Pulang',
  TIDAK_ABSEN: 'Tidak Absen Pulang',
});

const MS_MENIT = 60000;

/** Batas waktu sebuah jadwal dalam Date "dinding". */
export function batasJadwal(jadwal) {
  const [mulai, selesai] = intervalJadwal(jadwal);
  return {
    mulai: new Date(mulai * MS_MENIT),
    selesai: new Date(selesai * MS_MENIT),
    bukaMasuk: new Date((mulai - ATURAN_ABSEN.bukaSebelumMenit) * MS_MENIT),
    batasTerlambat: new Date((mulai + ATURAN_ABSEN.toleransiTerlambatMenit) * MS_MENIT),
    tutupPulang: new Date((selesai + ATURAN_ABSEN.batasPulangSetelahMenit) * MS_MENIT),
  };
}

export const statusMasuk = (jadwal, waktuMasuk) =>
  waktuMasuk > batasJadwal(jadwal).batasTerlambat ? KEHADIRAN.TERLAMBAT : KEHADIRAN.HADIR;

export const statusPulang = (jadwal, waktuPulang) =>
  waktuPulang < batasJadwal(jadwal).selesai ? PULANG.PULANG_CEPAT : PULANG.TEPAT_WAKTU;

const fmtWaktu = (d) => (d ? d.toISOString().slice(0, 19).replace('T', ' ') : null);
const fmtJamMenit = (d) => (d ? formatJam(d) : null);

function fmtDurasi(menit) {
  if (menit == null || menit < 0) return null;
  const j = Math.floor(menit / 60);
  const m = Math.round(menit % 60);
  return `${j} jam ${m} menit`;
}

/**
 * Gabungkan jadwal + absensinya menjadi satu baris riwayat.
 * Jadwal tanpa absensi yang sudah lewat dianggap "Tidak Hadir" (tidak perlu cron).
 */
export function barisRiwayat(jadwal, absensi, now = sekarang()) {
  const b = batasJadwal(jadwal);
  let status;
  let statusPulangTampil = absensi?.statusPulang ?? null;

  if (!absensi || !absensi.waktuMasuk) {
    if (absensi?.statusKehadiran === KEHADIRAN.TIDAK_HADIR || now > b.selesai) status = KEHADIRAN.TIDAK_HADIR;
    else status = now >= b.bukaMasuk ? 'Belum Absen' : 'Akan Datang';
  } else {
    status = absensi.statusKehadiran;
    if (!absensi.waktuPulang) {
      statusPulangTampil = now > b.tutupPulang ? PULANG.TIDAK_ABSEN : PULANG.BELUM;
    }
  }

  const menitKerja =
    absensi?.waktuMasuk && absensi?.waktuPulang
      ? (absensi.waktuPulang - absensi.waktuMasuk) / MS_MENIT
      : null;
  const menitTerlambat =
    absensi?.waktuMasuk && absensi.waktuMasuk > b.mulai ? Math.round((absensi.waktuMasuk - b.mulai) / MS_MENIT) : 0;

  return {
    idAbsensi: absensi?.idAbsensi ?? null,
    idJadwal: jadwal.idJadwal,
    tanggal: formatTanggal(jadwal.tanggal),
    jadwal: {
      jenisJadwal: jadwal.jenisJadwal,
      jamMulai: formatJam(jadwal.jamMulai),
      jamSelesai: formatJam(jadwal.jamSelesai),
      lembur: isLembur(jadwal.jenisJadwal),
    },
    lembur: isLembur(jadwal.jenisJadwal),
    waktuMasuk: fmtWaktu(absensi?.waktuMasuk),
    waktuPulang: fmtWaktu(absensi?.waktuPulang),
    jamMasuk: fmtJamMenit(absensi?.waktuMasuk),
    jamKeluar: fmtJamMenit(absensi?.waktuPulang),
    durasiMenit: menitKerja == null ? null : Math.round(menitKerja),
    durasi: fmtDurasi(menitKerja),
    menitTerlambat,
    statusKehadiran: status,
    statusPulang: statusPulangTampil,
    // status ringkas untuk badge di frontend
    status: status === KEHADIRAN.TIDAK_HADIR || !absensi?.waktuMasuk ? status
      : statusPulangTampil === PULANG.BELUM || statusPulangTampil === PULANG.TIDAK_ABSEN ? statusPulangTampil
      : status,
  };
}

/** Jadwal milik pegawai yang jendela absen masuknya sedang terbuka. */
export async function cariJadwalAktif(idPegawai, now = sekarang()) {
  const tgl = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const kandidat = await prisma.jadwal.findMany({
    where: { idPegawai, tanggal: { gte: tambahHari(tgl, -1), lte: tambahHari(tgl, 1) } },
    include: { absensi: true },
    orderBy: [{ tanggal: 'asc' }, { jamMulai: 'asc' }],
  });
  return kandidat
    .filter((j) => {
      const b = batasJadwal(j);
      return now >= b.bukaMasuk && now <= b.selesai && j.absensi.length === 0;
    })
    .sort((a, b) => batasJadwal(a).mulai - batasJadwal(b).mulai);
}

/** Absensi yang sudah masuk tapi belum pulang (dan masih dalam batas pulang). */
export async function cariAbsensiTerbuka(idPegawai, now = sekarang()) {
  const terbuka = await prisma.absensi.findMany({
    where: { idPegawai, waktuMasuk: { not: null }, waktuPulang: null, tanggal: { gte: tambahHari(now, -2) } },
    include: { jadwal: true },
    orderBy: { waktuMasuk: 'asc' },
  });
  return terbuka.filter((a) => now <= batasJadwal(a.jadwal).tutupPulang);
}

/** Pastikan waktu koreksi masuk akal untuk jadwalnya. */
export function validasiWaktuKoreksi(jadwal, waktuMasuk, waktuPulang) {
  const b = batasJadwal(jadwal);
  const awal = new Date(b.bukaMasuk.getTime() - 6 * 60 * MS_MENIT);
  const akhir = new Date(b.tutupPulang.getTime() + 6 * 60 * MS_MENIT);
  for (const [nama, w] of [['waktuMasukBaru', waktuMasuk], ['waktuPulangBaru', waktuPulang]]) {
    if (w && (w < awal || w > akhir)) {
      throw new ApiError(400, `${nama} terlalu jauh dari jadwal (${formatTanggal(jadwal.tanggal)} ${formatJam(jadwal.jamMulai)}-${formatJam(jadwal.jamSelesai)})`);
    }
  }
  if (waktuMasuk && waktuPulang && waktuPulang <= waktuMasuk) {
    throw new ApiError(400, 'Waktu pulang harus setelah waktu masuk');
  }
}

/** Parse 'YYYY-MM-DD HH:mm' / 'YYYY-MM-DDTHH:mm[:ss]' sebagai waktu lokal RS. */
export function parseWaktu(str) {
  if (typeof str !== 'string') return null;
  const m = str.trim().match(/^(\d{4}-\d{2}-\d{2})[ T]([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!m) return null;
  const d = new Date(`${m[1]}T${m[2]}:${m[3]}:${m[4] ?? '00'}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

