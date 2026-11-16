import bcrypt from 'bcryptjs';
import 'dotenv/config';
import prisma from '../src/config/prisma.js';

async function main() {
  const defaultPassword = await bcrypt.hash('password123', 12);

  // 1. Seed Pedoman Penggajian jika belum ada
  const countPedoman = await prisma.pedoman_penggajian.count();
  if (countPedoman === 0) {
    console.log('Seeding pedoman penggajian...');
    const perans = await prisma.peran_tenaga_medis.findMany();
    for (const p of perans) {
      await prisma.pedoman_penggajian.create({
        data: {
          idPeran: p.idPeran,
          gajiPokok: 5000000,
          tunjanganJabatan: 1000000,
          tunjanganShiftMalam: 75000,
          uangLemburPerJam: 50000,
          tunjanganKehadiranPerHari: 25000,
          persenInsentifJasaMedis: 5.0,
          potonganTidakHadirPerHari: 150000,
          potonganTerlambatPerKejadian: 50000,
          berlakuMulai: new Date('2026-01-01'),
          keterangan: `Pedoman Standar 2026 - ${p.namaPeran}`,
        },
      });
    }
  }

  // 2. Seed Pegawai & Akun untuk 4 role
  const usersToSeed = [
    {
      nama: 'Ns. Ayu Lestari, S.Kep., Ns.',
      nip: '198904122014022001',
      alamat: 'Jl. Merpati No. 12, Jakarta',
      noTelp: '081298765432',
      email: 'ayu.lestari@medika.hospital',
      jabatan: 'Perawat Pelaksana',
      unitKerja: 'Unit Rawat Inap',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2020-03-01'),
      sisaJatahCuti: 12,
      idPeran: 'PRN0000004', // Perawat
      username: 'ayulestari',
      role: 'Tenaga Medis',
    },
    {
      nama: 'Athaya Rahmania, S.Psi.',
      nip: '198205152008011003',
      alamat: 'Jl. Kenanga No. 45, Jakarta',
      noTelp: '081234567891',
      email: 'hrd.athaya@medika.hospital',
      jabatan: 'Staff HRD & Personalia',
      unitKerja: 'Divisi SDM & Kepegawaian',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2018-05-15'),
      sisaJatahCuti: 12,
      idPeran: null,
      username: 'athaya',
      role: 'HRD',
    },
    {
      nama: 'Rizky Ramadhani, A.Md.',
      nip: '199103202015022002',
      alamat: 'Jl. Anggrek No. 8, Jakarta',
      noTelp: '081345678912',
      email: 'sekretaris.inap@medika.hospital',
      jabatan: 'Sekretaris Unit Rawat Inap',
      unitKerja: 'Unit Rawat Inap',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2019-02-01'),
      sisaJatahCuti: 10,
      idPeran: null,
      username: 'rizky',
      role: 'Sekretaris Unit',
    },
    {
      nama: 'Bambang Sudiro, S.E., Ak.',
      nip: '198511102010011005',
      alamat: 'Jl. Melati Blok C No. 2, Jakarta',
      noTelp: '081223344556',
      email: 'payroll.bambang@medika.hospital',
      jabatan: 'Manajer Keuangan & Payroll',
      unitKerja: 'Divisi Keuangan',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2016-10-10'),
      sisaJatahCuti: 12,
      idPeran: null,
      username: 'bambang',
      role: 'Manajemen Keuangan',
    },
  ];

  for (const u of usersToSeed) {
    let pegawai = await prisma.pegawai.findUnique({ where: { email: u.email } });
    if (!pegawai) {
      pegawai = await prisma.pegawai.create({
        data: {
          nama: u.nama,
          nip: u.nip,
          alamat: u.alamat,
          noTelp: u.noTelp,
          email: u.email,
          jabatan: u.jabatan,
          unitKerja: u.unitKerja,
          statusPegawai: u.statusPegawai,
          tanggalMasuk: u.tanggalMasuk,
          sisaJatahCuti: u.sisaJatahCuti,
          idPeran: u.idPeran,
        },
      });
      console.log(`Pegawai created: ${u.nama} (${pegawai.idPegawai})`);
    }

    await prisma.akun.upsert({
      where: { idPegawai: pegawai.idPegawai },
      update: {
        username: u.username,
        password: defaultPassword,
        role: u.role,
      },
      create: {
        idPegawai: pegawai.idPegawai,
        username: u.username,
        password: defaultPassword,
        role: u.role,
      },
    });
    console.log(`Akun ready: ${u.username} (${u.role})`);

    // Tambah rekening untuk tenaga medis & lainnya jika belum ada
    const rek = await prisma.rekening_pegawai.findFirst({ where: { idPegawai: pegawai.idPegawai } });
    if (!rek) {
      await prisma.rekening_pegawai.create({
        data: {
          idPegawai: pegawai.idPegawai,
          namaBank: 'Bank Mandiri',
          nomorRekening: '137001' + Math.floor(100000 + Math.random() * 900000),
          atasNama: u.nama,
        },
      });
    }

    // Buat jadwal untuk tenaga medis (Ayu Lestari) jika belum ada
    if (u.role === 'Tenaga Medis') {
      const existingJadwal = await prisma.jadwal.findFirst({ where: { idPegawai: pegawai.idPegawai } });
      if (!existingJadwal) {
        const today = new Date();
        const start = new Date(today);
        start.setHours(7, 0, 0, 0);
        const end = new Date(today);
        end.setHours(14, 0, 0, 0);

        const jdw = await prisma.jadwal.create({
          data: {
            idPegawai: pegawai.idPegawai,
            tanggal: today,
            jamMulai: start,
            jamSelesai: end,
            jenisJadwal: 'Shift Pagi',
          },
        });
        console.log(`Jadwal created for ${u.nama}: ${jdw.idJadwal}`);

        // Buat absensi sample
        await prisma.absensi.create({
          data: {
            idPegawai: pegawai.idPegawai,
            idJadwal: jdw.idJadwal,
            tanggal: today,
            waktuMasuk: new Date(),
            statusKehadiran: 'Hadir Tepat Waktu',
          },
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
