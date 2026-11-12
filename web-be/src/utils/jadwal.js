/**
 * Konfigurasi & helper waktu untuk penjadwalan.
 * Kolom DATE/TIME di Prisma dibaca sebagai Date UTC, jadi semua hitungan di sini memakai UTC.
 */
import 'dotenv/config';

/** Shift untuk tenaga medis non dokter spesialis. Malam melewati tengah malam. */
export const SHIFT = Object.freeze({
  Pagi: { jenisJadwal: 'Shift Pagi', jamMulai: '07:00', jamSelesai: '14:00' },
  Siang: { jenisJadwal: 'Shift Siang', jamMulai: '14:00', jamSelesai: '21:00' },
  Malam: { jenisJadwal: 'Shift Malam', jamMulai: '21:00', jamSelesai: '07:00' },
});

/** Jadwal default dokter spesialis (bisa diubah lewat pengajuan ke Sekretaris Unit). */
export const JADWAL_SPESIALIS_DEFAULT = Object.freeze({
  jenisJadwal: 'Praktik',
  jamMulai: '08:00',
  jamSelesai: '14:00',
  hari: [1, 2, 3, 4, 5], // 0 = Minggu ... 6 = Sabtu -> default Senin-Jumat
});

export const JENIS_PRAKTIK = JADWAL_SPESIALIS_DEFAULT.jenisJadwal;

/**
 * Non spesialis maksimal 1 shift reguler per hari (dihitung dari tanggal mulai shift).
 * Shift tambahan di hari yang sama disimpan sebagai lembur, mis. "Lembur Shift Siang".
 */
export const PREFIX_LEMBUR = 'Lembur ';
export const isLembur = (jenisJadwal) => String(jenisJadwal ?? '').startsWith(PREFIX_LEMBUR);
export const jenisLembur = (jenisJadwal) =>
  isLembur(jenisJadwal) ? jenisJadwal : `${PREFIX_LEMBUR}${jenisJadwal}`;
export const jenisReguler = (jenisJadwal) =>
  isLembur(jenisJadwal) ? jenisJadwal.slice(PREFIX_LEMBUR.length) : jenisJadwal;

const MENIT_SEHARI = 24 * 60;
const MS_SEHARI = 24 * 60 * 60 * 1000;

/** Pegawai dianggap dokter spesialis jika nama perannya mengandung "Spesialis". */
export const isSpesialis = (pegawai) =>
  /spesialis/i.test(pegawai?.peran_tenaga_medis?.namaPeran ?? '');

const RE_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;
const RE_JAM = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

/** 'YYYY-MM-DD' -> Date (UTC tengah malam). Null jika format tidak valid. */
export function parseTanggal(str) {
  if (typeof str !== 'string' || !RE_TANGGAL.test(str)) return null;
  const d = new Date(`${str}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== str ? null : d;
}

/** 'HH:mm' / 'HH:mm:ss' -> Date untuk kolom TIME. Null jika format tidak valid. */
export function parseJam(str) {
  if (typeof str !== 'string' || !RE_JAM.test(str)) return null;
  return new Date(`1970-01-01T${str.length === 5 ? `${str}:00` : str}Z`);
}

export const formatTanggal = (d) => d.toISOString().slice(0, 10);
export const formatJam = (d) => d.toISOString().slice(11, 16);
const menitDariJam = (d) => d.getUTCHours() * 60 + d.getUTCMinutes();

/**
 * Waktu "dinding" RS (default WIB, UTC+7) direpresentasikan sebagai Date UTC,
 * konsisten dengan kolom DATE/TIME/TIMESTAMP (tanpa zona waktu) di database.
 */
const OFFSET_MENIT = Number(process.env.APP_TZ_OFFSET_MINUTES ?? 420);
export const sekarang = () => new Date(Date.now() + OFFSET_MENIT * 60000);

/** Hari ini (tanggal lokal RS) sebagai Date UTC tengah malam. */
export function hariIni() {
  const now = sekarang();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export const tambahHari = (d, n) => new Date(d.getTime() + n * MS_SEHARI);

/** Interval absolut [mulai, selesai) dalam menit; jamSelesai <= jamMulai berarti lewat tengah malam. */
export function intervalJadwal({ tanggal, jamMulai, jamSelesai }) {
  const base = tanggal.getTime() / 60000;
  const mulai = base + menitDariJam(jamMulai);
  let selesai = base + menitDariJam(jamSelesai);
  if (selesai <= mulai) selesai += MENIT_SEHARI;
  return [mulai, selesai];
}

export function isTumpangTindih(a, b) {
  const [a1, a2] = intervalJadwal(a);
  const [b1, b2] = intervalJadwal(b);
  return a1 < b2 && b1 < a2;
}

/** Cari shift dari pasangan jam. Mengembalikan { nama: 'Pagi', jenisJadwal, ... } atau null. */
export function shiftDariJam(jamMulai, jamSelesai) {
  const m = formatJam(jamMulai);
  const s = formatJam(jamSelesai);
  const entry = Object.entries(SHIFT).find(([, x]) => x.jamMulai === m && x.jamSelesai === s);
  return entry ? { nama: entry[0], ...entry[1] } : null;
}

/** Durasi jadwal dalam jam (dipakai untuk menghitung jam lembur di penggajian). */
export function durasiJam(j) {
  const [mulai, selesai] = intervalJadwal(j);
  return (selesai - mulai) / 60;
}

/** Ubah record jadwal dari Prisma menjadi format yang enak dibaca frontend. */
export function serializeJadwal(j) {
  return {
    ...j,
    tanggal: formatTanggal(j.tanggal),
    jamMulai: formatJam(j.jamMulai),
    jamSelesai: formatJam(j.jamSelesai),
    lembur: isLembur(j.jenisJadwal),
    durasiJam: durasiJam(j),
  };
}

