import prisma from '../config/prisma.js';
import { ApiError } from '../utils/http.js';
import { formatTanggal, hariIni, sekarang, tambahHari } from '../utils/jadwal.js';
import { KEHADIRAN } from './absensi.service.js';

export const STATUS = Object.freeze({
  MENUNGGU: 'Menunggu',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
  DIBATALKAN: 'Dibatalkan',
});

/** Jenis cuti; hanya yang `potongJatah` mengurangi sisaJatahCuti (maks 12/tahun). */
export const JENIS_CUTI = Object.freeze({
  'Cuti Tahunan': { potongJatah: true, maksHari: 12 },
  'Cuti Melahirkan': { potongJatah: false, maksHari: 90 },
  'Cuti Alasan Penting': { potongJatah: false, maksHari: 3 },
  'Cuti Besar': { potongJatah: false, maksHari: 30 },
});

/** Jenis izin (tabel pengajuan_ketidakhadiran). Sakit boleh diajukan mundur & wajib berkas. */
export const JENIS_IZIN = Object.freeze({
  Izin: { status: KEHADIRAN.IZIN, bolehMundurHari: 0, wajibBerkas: false, maksHari: 3 },
  Sakit: { status: KEHADIRAN.SAKIT, bolehMundurHari: 3, wajibBerkas: true, maksHari: 14 },
});

export const jumlahHari = (mulai, selesai) => Math.round((selesai - mulai) / 86400000) + 1;

export function daftarTanggal(mulai, selesai) {
  return Array.from({ length: jumlahHari(mulai, selesai) }, (_, i) => tambahHari(mulai, i));
}

/** Cek dasar pengajuan: pegawai aktif & tidak tumpang tindih dengan cuti/izin lain yang aktif. */
export async function validasiPengajuanDasar(pegawai, mulai, selesai) {
  if (pegawai.statusPegawai !== 'Aktif') throw new ApiError(400, 'Pegawai tidak berstatus Aktif');

  const aktif = { in: [STATUS.MENUNGGU, STATUS.DISETUJUI] };
  const overlap = { tanggalMulai: { lte: selesai }, tanggalSelesai: { gte: mulai } };
  const [cuti, izin] = await Promise.all([
    prisma.pengajuan_cuti.findFirst({ where: { idPegawai: pegawai.idPegawai, status: aktif, ...overlap } }),
    prisma.pengajuan_ketidakhadiran.findFirst({ where: { idPegawai: pegawai.idPegawai, status: aktif, ...overlap } }),
  ]);
  const bentrok = cuti ?? izin;
  if (bentrok) {
    throw new ApiError(
      409,
      `Sudah ada pengajuan ${cuti ? bentrok.jenisCuti : bentrok.jenis} (${bentrok.status}) ` +
        `pada ${formatTanggal(bentrok.tanggalMulai)} s/d ${formatTanggal(bentrok.tanggalSelesai)}`,
    );
  }
}

/** Kuota cuti per tanggal (tabel data_cuti_tanggal, default 10 orang/hari). */
export async function cekKuota(client, tanggalList) {
  const rows = await client.data_cuti_tanggal.findMany({ where: { tanggal: { in: tanggalList } } });
  const penuh = rows.filter((r) => r.jumlahTerpakai >= r.kuotaMaksimal);
  if (penuh.length) {
    throw new ApiError(409, `Kuota cuti penuh pada: ${penuh.map((r) => formatTanggal(r.tanggal)).join(', ')}`);
  }
}

export async function pakaiKuota(tx, tanggalList) {
  await cekKuota(tx, tanggalList);
  for (const tanggal of tanggalList) {
    await tx.data_cuti_tanggal.upsert({
      where: { tanggal },
      create: { tanggal, jumlahTerpakai: 1 },
      update: { jumlahTerpakai: { increment: 1 } },
    });
  }
}

/**
 * Tandai jadwal pegawai di rentang tanggal sebagai Cuti/Izin/Sakit di tabel absensi,
 * supaya tidak dihitung "Tidak Hadir" dan tombol absen tidak muncul.
 * Absensi yang sudah ada jam masuknya tidak diubah.
 */
export async function tandaiAbsensi(tx, idPegawai, mulai, selesai, statusKehadiran) {
  const jadwal = await tx.jadwal.findMany({
    where: { idPegawai, tanggal: { gte: mulai, lte: selesai } },
    include: { absensi: true },
  });
  let jumlah = 0;
  for (const j of jadwal) {
    const a = j.absensi[0];
    if (a?.waktuMasuk) continue;
    if (a) {
      await tx.absensi.update({ where: { idAbsensi: a.idAbsensi }, data: { statusKehadiran, statusPulang: null } });
    } else {
      await tx.absensi.create({ data: { idPegawai, idJadwal: j.idJadwal, tanggal: j.tanggal, statusKehadiran } });
    }
    jumlah++;
  }
  return jumlah;
}

const ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** Nomor surat: SKC/001/XI/2026 (urut per bulan). */
export async function nomorSuratBaru(tx) {
  const now = hariIni();
  const bulan = ROMAWI[now.getUTCMonth()];
  const tahun = now.getUTCFullYear();
  const suffix = `/${bulan}/${tahun}`;
  const jumlah = await tx.surat_hasil_cuti.count({ where: { nomorSurat: { endsWith: suffix } } });
  return `SKC/${String(jumlah + 1).padStart(3, '0')}${suffix}`;
}

/** Simpan notifikasi untuk pemilik pengajuan cuti (jika punya akun). */
export async function notifikasiCuti(tx, idPegawai, idPengajuan, pesan) {
  const akun = await tx.akun.findUnique({ where: { idPegawai }, select: { idAkun: true } });
  if (!akun) return;
  await tx.notifikasi.create({
    data: {
      idAkun: akun.idAkun,
      idPengajuan,
      pesan: pesan.slice(0, 255),
      statusKirim: 'Terkirim',
      tanggalKirim: sekarang(),
    },
  });
}
