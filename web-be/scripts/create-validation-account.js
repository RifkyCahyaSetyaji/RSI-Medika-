import bcrypt from 'bcryptjs';
import 'dotenv/config';
import prisma from '../src/config/prisma.js';
import { parseJam } from '../src/utils/jadwal.js';
import { prosesHitungPegawai } from '../src/services/penggajian.service.js';

async function main() {
  console.log('=== Update Skenario Akun Validasi Penggajian: 20 Hadir, 5 Terlambat, 5 Lembur ===');

  const defaultPassword = await bcrypt.hash('password123', 12);

  // 1. Ambil atau Buat Pegawai
  const nip = '199201012020121001';
  const email = 'validasi.gaji@medika.hospital';
  const username = 'validasi.gaji';

  let pegawai = await prisma.pegawai.findUnique({ where: { nip } });

  if (!pegawai) {
    pegawai = await prisma.pegawai.create({
      data: {
        nip,
        nama: 'dr. Budi Validasi, Sp.A',
        email,
        noTelp: '081299887766',
        alamat: 'Jl. Pengujian Validasi Gaji No. 1, Jakarta',
        jabatan: 'Dokter Spesialis Anak',
        unitKerja: 'Poliklinik Anak',
        statusPegawai: 'Aktif',
        tanggalMasuk: new Date('2020-01-01'),
        sisaJatahCuti: 12,
        idPeran: 'PRN0000002', // Dokter Spesialis
      },
    });
  }

  // 2. Hubungkan pegawai_peran jika belum ada
  const existingPeran = await prisma.pegawai_peran.findFirst({
    where: { idPegawai: pegawai.idPegawai, idPeran: 'PRN0000002' },
  });
  if (!existingPeran) {
    await prisma.pegawai_peran.create({
      data: {
        idPegawai: pegawai.idPegawai,
        idPeran: 'PRN0000002',
      },
    });
  }

  // 3. Rekening Pegawai
  const existingRek = await prisma.rekening_pegawai.findFirst({
    where: { idPegawai: pegawai.idPegawai },
  });
  if (!existingRek) {
    await prisma.rekening_pegawai.create({
      data: {
        idPegawai: pegawai.idPegawai,
        namaBank: 'Bank Mandiri',
        nomorRekening: '137-00-9988771-0',
        atasNama: 'dr. Budi Validasi, Sp.A',
      },
    });
  }

  // 4. Akun Login
  await prisma.akun.upsert({
    where: { username },
    update: { password: defaultPassword, role: 'Tenaga Medis' },
    create: {
      idPegawai: pegawai.idPegawai,
      username,
      password: defaultPassword,
      role: 'Tenaga Medis',
    },
  });

  // 5. Bersihkan jadwal & absensi lama di November 2026
  const jdwLama = await prisma.jadwal.findMany({
    where: {
      idPegawai: pegawai.idPegawai,
      tanggal: {
        gte: new Date('2026-11-01'),
        lte: new Date('2026-11-30'),
      },
    },
    include: { absensi: true },
  });

  for (const j of jdwLama) {
    await prisma.absensi.deleteMany({ where: { idJadwal: j.idJadwal } });
    await prisma.jadwal.delete({ where: { idJadwal: j.idJadwal } });
  }

  // Skenario Spesifik:
  // - 20 Hari Hadir Reguler (15 Hari Tepat Waktu + 5 Hari Terlambat)
  // - 5 Sesi Lembur (@ 1 jam = 5 jam lembur)
  const skenarioJadwal = [
    // 15 Hari Hadir Tepat Waktu
    { tgl: '2026-11-02', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:55:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-03', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:50:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-04', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:58:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-05', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:52:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-06', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:59:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-09', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:50:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-10', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:53:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-11', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:55:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-12', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:50:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-13', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:54:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-16', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:52:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-17', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:58:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-18', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:50:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-19', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:55:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-20', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Hadir', jamMasuk: '06:51:00', jamPulang: '14:00:00' },

    // 5 Hari Hadir Terlambat (Status: Terlambat, Masuk lewat pk 07:00)
    { tgl: '2026-11-23', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Terlambat', jamMasuk: '07:25:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-24', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Terlambat', jamMasuk: '07:30:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-25', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Terlambat', jamMasuk: '07:15:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-26', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Terlambat', jamMasuk: '07:20:00', jamPulang: '14:00:00' },
    { tgl: '2026-11-27', jenis: 'Shift Pagi', mulai: '07:00:00', selesai: '14:00:00', status: 'Terlambat', jamMasuk: '07:35:00', jamPulang: '14:00:00' },

    // 5 Sesi Lembur (@ 1 jam = 5 jam lembur)
    { tgl: '2026-11-04', jenis: 'Lembur Sore', mulai: '14:00:00', selesai: '15:00:00', status: 'Hadir', jamMasuk: '14:00:00', jamPulang: '15:00:00' },
    { tgl: '2026-11-06', jenis: 'Lembur Sore', mulai: '14:00:00', selesai: '15:00:00', status: 'Hadir', jamMasuk: '14:00:00', jamPulang: '15:00:00' },
    { tgl: '2026-11-11', jenis: 'Lembur Sore', mulai: '14:00:00', selesai: '15:00:00', status: 'Hadir', jamMasuk: '14:00:00', jamPulang: '15:00:00' },
    { tgl: '2026-11-18', jenis: 'Lembur Sore', mulai: '14:00:00', selesai: '15:00:00', status: 'Hadir', jamMasuk: '14:00:00', jamPulang: '15:00:00' },
    { tgl: '2026-11-25', jenis: 'Lembur Sore', mulai: '14:00:00', selesai: '15:00:00', status: 'Hadir', jamMasuk: '14:00:00', jamPulang: '15:00:00' },
  ];

  for (const s of skenarioJadwal) {
    const shiftDate = new Date(`${s.tgl}T00:00:00.000Z`);
    const jdw = await prisma.jadwal.create({
      data: {
        idPegawai: pegawai.idPegawai,
        tanggal: shiftDate,
        jamMulai: parseJam(s.mulai),
        jamSelesai: parseJam(s.selesai),
        jenisJadwal: s.jenis,
      },
    });

    const waktuMasuk = s.jamMasuk ? new Date(`${s.tgl}T${s.jamMasuk}Z`) : null;
    const waktuPulang = s.jamPulang ? new Date(`${s.tgl}T${s.jamPulang}Z`) : null;

    await prisma.absensi.create({
      data: {
        idPegawai: pegawai.idPegawai,
        idJadwal: jdw.idJadwal,
        tanggal: shiftDate,
        waktuMasuk,
        waktuPulang,
        statusKehadiran: s.status,
      },
    });
  }
  console.log(`✓ 20 Jadwal Reguler (15 Tepat Waktu + 5 Terlambat) dan 5 Jadwal Lembur berhasil di-seed`);

  // 6. Hitung Penggajian dengan Service Resmi
  const periode = '2026-11';
  await prisma.penggajian.deleteMany({
    where: { idPegawai: pegawai.idPegawai, periodeGaji: periode },
  });

  const hasilHitung = await prosesHitungPegawai(pegawai, periode, {
    nilaiJasaMedis: 0,
  });

  console.log('\n✓ Hasil Perhitungan Sistem:');
  console.log({
    periode: hasilHitung.periodeGaji,
    gajiPokok: hasilHitung.gajiPokok,
    tunjangan: hasilHitung.tunjangan,
    potongan: hasilHitung.potongan,
    totalGaji: hasilHitung.totalGaji,
    metrikKehadiran: hasilHitung.metrikKehadiran,
  });

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
