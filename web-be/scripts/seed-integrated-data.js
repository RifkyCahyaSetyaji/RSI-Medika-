import bcrypt from 'bcryptjs';
import 'dotenv/config';
import prisma from '../src/config/prisma.js';
import { hariIni, sekarang, tambahHari, parseJam } from '../src/utils/jadwal.js';

async function main() {
  console.log('--- Memulai Seeding Data Terintegrasi RSI Medika ---');

  const defaultPassword = await bcrypt.hash('password123', 12);
  const today = hariIni();

  // 1. Pastikan Peran Tenaga Medis lengkap
  const peransMaster = [
    { idPeran: 'PRN0000001', namaPeran: 'Dokter Umum', kategori: 'Medis', deskripsi: 'Pelayanan medis umum dan gawat darurat' },
    { idPeran: 'PRN0000002', namaPeran: 'Dokter Spesialis', kategori: 'Medis', deskripsi: 'Pelayanan medis spesialisasi bangsal & poliklinik' },
    { idPeran: 'PRN0000003', namaPeran: 'Dokter Gigi', kategori: 'Medis', deskripsi: 'Pelayanan kesehatan gigi dan mulut' },
    { idPeran: 'PRN0000004', namaPeran: 'Perawat', kategori: 'Keperawatan', deskripsi: 'Asuhan keperawatan rawat inap, ICU & rawat jalan' },
    { idPeran: 'PRN0000005', namaPeran: 'Bidan', kategori: 'Kebidanan', deskripsi: 'Pelayanan kebidanan dan persalinan' },
    { idPeran: 'PRN0000006', namaPeran: 'Apoteker', kategori: 'Kefarmasian', deskripsi: 'Pelayanan farmasi klinis dan peracikan obat' },
    { idPeran: 'PRN0000007', namaPeran: 'Analis Laboratorium', kategori: 'Penunjang', deskripsi: 'Pemeriksaan laboratorium patologi klinis' },
    { idPeran: 'PRN0000008', namaPeran: 'Radiografer', kategori: 'Penunjang', deskripsi: 'Pemeriksaan pencitraan diagnostik & rontgen' },
    { idPeran: 'PRN0000009', namaPeran: 'Fisioterapis', kategori: 'Penunjang', deskripsi: 'Rehabilitasi medis dan terapi fisik' },
    { idPeran: 'PRN0000010', namaPeran: 'Ahli Gizi', kategori: 'Penunjang', deskripsi: 'Pengaturan nutrisi dan diet klinis pasien' },
  ];

  for (const pr of peransMaster) {
    await prisma.peran_tenaga_medis.upsert({
      where: { idPeran: pr.idPeran },
      update: { namaPeran: pr.namaPeran, kategori: pr.kategori, deskripsi: pr.deskripsi },
      create: pr,
    });
  }
  console.log('✓ 10 Peran Tenaga Medis terverifikasi.');

  // 2. Pedoman Penggajian untuk setiap peran
  const pedomanConfig = [
    { idPeran: 'PRN0000001', gaji: 8000000, tunjJabatan: 1500000, nightShift: 100000, lembur: 75000 },
    { idPeran: 'PRN0000002', gaji: 14000000, tunjJabatan: 3000000, nightShift: 150000, lembur: 100000 },
    { idPeran: 'PRN0000003', gaji: 9000000, tunjJabatan: 1500000, nightShift: 100000, lembur: 75000 },
    { idPeran: 'PRN0000004', gaji: 5200000, tunjJabatan: 800000, nightShift: 75000, lembur: 50000 },
    { idPeran: 'PRN0000005', gaji: 5200000, tunjJabatan: 800000, nightShift: 75000, lembur: 50000 },
    { idPeran: 'PRN0000006', gaji: 6500000, tunjJabatan: 1000000, nightShift: 75000, lembur: 60000 },
    { idPeran: 'PRN0000007', gaji: 4800000, tunjJabatan: 600000, nightShift: 65000, lembur: 45000 },
    { idPeran: 'PRN0000008', gaji: 4800000, tunjJabatan: 600000, nightShift: 65000, lembur: 45000 },
    { idPeran: 'PRN0000009', gaji: 4800000, tunjJabatan: 600000, nightShift: 65000, lembur: 45000 },
    { idPeran: 'PRN0000010', gaji: 4800000, tunjJabatan: 600000, nightShift: 65000, lembur: 45000 },
  ];

  for (const pc of pedomanConfig) {
    const existing = await prisma.pedoman_penggajian.findFirst({
      where: { idPeran: pc.idPeran, berlakuMulai: new Date('2026-01-01') },
    });
    if (!existing) {
      await prisma.pedoman_penggajian.create({
        data: {
          idPeran: pc.idPeran,
          gajiPokok: pc.gaji,
          tunjanganJabatan: pc.tunjJabatan,
          tunjanganShiftMalam: pc.nightShift,
          uangLemburPerJam: pc.lembur,
          tunjanganKehadiranPerHari: 25000,
          persenInsentifJasaMedis: 5.0,
          potonganTidakHadirPerHari: 150000,
          potonganTerlambatPerKejadian: 50000,
          berlakuMulai: new Date('2026-01-01'),
          keterangan: `Pedoman Standar Medika 2026`,
        },
      });
    }
  }
  console.log('✓ Pedoman Penggajian terverifikasi.');

  // 3. Daftar Pegawai yang Saling Terintegrasi
  const pegawaiData = [
    // Core 4 Roles
    {
      nip: '198904122014022001',
      nama: 'Ns. Ayu Lestari, S.Kep., Ns.',
      email: 'ayu.lestari@medika.hospital',
      noTelp: '081298765432',
      alamat: 'Jl. Merpati No. 12, Surabaya',
      jabatan: 'Perawat Pelaksana',
      unitKerja: 'Unit Rawat Inap',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2020-03-01'),
      sisaJatahCuti: 12,
      idPeran: 'PRN0000004',
      username: 'ayulestari',
      role: 'Tenaga Medis',
      bank: 'Bank Mandiri',
      rek: '137001458921',
    },
    {
      nip: '198205152008011003',
      nama: 'Athaya Rahmania, S.Psi.',
      email: 'hrd.athaya@medika.hospital',
      noTelp: '081234567891',
      alamat: 'Jl. Kenanga No. 45, Surabaya',
      jabatan: 'Staff HRD & Personalia',
      unitKerja: 'Divisi SDM & Kepegawaian',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2018-05-15'),
      sisaJatahCuti: 12,
      idPeran: null,
      username: 'athaya',
      role: 'HRD',
      bank: 'Bank Mandiri',
      rek: '137001890214',
    },
    {
      nip: '199103202015022002',
      nama: 'Rizky Ramadhani, A.Md.',
      email: 'sekretaris.inap@medika.hospital',
      noTelp: '081345678912',
      alamat: 'Jl. Anggrek No. 8, Surabaya',
      jabatan: 'Sekretaris Unit Rawat Inap',
      unitKerja: 'Unit Rawat Inap',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2019-02-01'),
      sisaJatahCuti: 10,
      idPeran: null,
      username: 'rizky',
      role: 'Sekretaris Unit',
      bank: 'Bank Mandiri',
      rek: '137001224567',
    },
    {
      nip: '198511102010011005',
      nama: 'Bambang Sudiro, S.E., Ak.',
      email: 'payroll.bambang@medika.hospital',
      noTelp: '081223344556',
      alamat: 'Jl. Melati Blok C No. 2, Surabaya',
      jabatan: 'Manajer Keuangan & Payroll',
      unitKerja: 'Divisi Keuangan',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2016-10-10'),
      sisaJatahCuti: 12,
      idPeran: null,
      username: 'bambang',
      role: 'Manajemen Keuangan',
      bank: 'Bank Mandiri',
      rek: '137001993412',
    },

    // Dokter Spesialis & Dokter Umum di Unit Rawat Inap & Bangsal
    {
      nip: '197906102006041002',
      nama: 'dr. Hendra Wijaya, Sp.A',
      email: 'dr.hendra@medika.hospital',
      noTelp: '081233445566',
      alamat: 'Jl. Kertajaya Indah No. 15, Surabaya',
      jabatan: 'Dokter Spesialis Anak',
      unitKerja: 'Unit Rawat Inap',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2015-01-10'),
      sisaJatahCuti: 9,
      idPeran: 'PRN0000002',
      username: 'drhendra',
      role: 'Tenaga Medis',
      bank: 'BCA',
      rek: '0189345210',
    },
    {
      nip: '198801242013121001',
      nama: 'dr. Dimas Wicaksono',
      email: 'dr.dimas@medika.hospital',
      noTelp: '081344556677',
      alamat: 'Jl. Manyar Kertoarjo No. 22, Surabaya',
      jabatan: 'Dokter Umum Bangsal & IGD',
      unitKerja: 'Unit Rawat Inap',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2018-08-01'),
      sisaJatahCuti: 11,
      idPeran: 'PRN0000001',
      username: 'drdimas',
      role: 'Tenaga Medis',
      bank: 'Bank Mandiri',
      rek: '137002341098',
    },

    // Tim Perawat Unit Rawat Inap & ICU
    {
      nip: '199208152016022003',
      nama: 'Ns. Rani Oktavia, S.Kep.',
      email: 'rani.oktavia@medika.hospital',
      noTelp: '081255667788',
      alamat: 'Jl. Rungkut Asri No. 11, Surabaya',
      jabatan: 'Perawat Penanggung Jawab Shift',
      unitKerja: 'Unit Rawat Inap',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2019-06-15'),
      sisaJatahCuti: 10,
      idPeran: 'PRN0000004',
      username: 'ranioktavia',
      role: 'Tenaga Medis',
      bank: 'BNI',
      rek: '0459812345',
    },
    {
      nip: '199402102018011002',
      nama: 'Bima Pratama, A.Md.Kep.',
      email: 'bima.pratama@medika.hospital',
      noTelp: '081266778899',
      alamat: 'Jl. Dharmawangsa No. 34, Surabaya',
      jabatan: 'Perawat Pelaksana ICU & Bangsal',
      unitKerja: 'Unit Rawat Inap',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2021-04-01'),
      sisaJatahCuti: 12,
      idPeran: 'PRN0000004',
      username: 'bimapratama',
      role: 'Tenaga Medis',
      bank: 'Bank Mandiri',
      rek: '137004561230',
    },
    {
      nip: '199507192019032004',
      nama: 'Siti Nurhaliza, A.Md.Kep.',
      email: 'siti.nurhaliza@medika.hospital',
      noTelp: '081277889900',
      alamat: 'Jl. Jemursari No. 89, Surabaya',
      jabatan: 'Perawat Pelaksana Rawat Inap',
      unitKerja: 'Unit Rawat Inap',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2022-01-10'),
      sisaJatahCuti: 12,
      idPeran: 'PRN0000004',
      username: 'sitinurhaliza',
      role: 'Tenaga Medis',
      bank: 'BRI',
      rek: '312001984521',
    },

    // Penunjang Medis (Farmasi & Laboratorium)
    {
      nip: '199011052015031001',
      nama: 'apt. Farhan Ramadhan, S.Farm.',
      email: 'farhan.apt@medika.hospital',
      noTelp: '081288990011',
      alamat: 'Jl. Baratajaya No. 56, Surabaya',
      jabatan: 'Apoteker Penanggung Jawab Farmasi',
      unitKerja: 'Instalasi Farmasi',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2017-09-01'),
      sisaJatahCuti: 12,
      idPeran: 'PRN0000006',
      username: 'farhan',
      role: 'Tenaga Medis',
      bank: 'Bank Mandiri',
      rek: '137005672341',
    },
    {
      nip: '199304142017042002',
      nama: 'Dewi Sartika, A.Md.AK.',
      email: 'dewi.lab@medika.hospital',
      noTelp: '081299001122',
      alamat: 'Jl. Bratang Binangun No. 7, Surabaya',
      jabatan: 'Pranata Laboratorium Kesehatan',
      unitKerja: 'Laboratorium Medis',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date('2020-11-15'),
      sisaJatahCuti: 11,
      idPeran: 'PRN0000007',
      username: 'dewisartika',
      role: 'Tenaga Medis',
      bank: 'BNI',
      rek: '0567891230',
    },
  ];

  const mapPegawai = new Map();

  for (const p of pegawaiData) {
    let peg = await prisma.pegawai.findUnique({ where: { email: p.email } });
    if (!peg) {
      peg = await prisma.pegawai.create({
        data: {
          nip: p.nip,
          nama: p.nama,
          email: p.email,
          noTelp: p.noTelp,
          alamat: p.alamat,
          jabatan: p.jabatan,
          unitKerja: p.unitKerja,
          statusPegawai: p.statusPegawai,
          tanggalMasuk: p.tanggalMasuk,
          sisaJatahCuti: p.sisaJatahCuti,
          idPeran: p.idPeran,
        },
      });
      console.log(`+ Pegawai baru: ${p.nama} (${peg.idPegawai})`);
    } else {
      // Pastikan data penting seperti unitKerja dan idPeran sinkron
      peg = await prisma.pegawai.update({
        where: { idPegawai: peg.idPegawai },
        data: {
          unitKerja: p.unitKerja,
          jabatan: p.jabatan,
          idPeran: p.idPeran,
          sisaJatahCuti: p.sisaJatahCuti,
        },
      });
    }

    mapPegawai.set(p.username, peg);

    // Hubungkan juga ke tabel pegawai_peran jika memiliki peran
    if (p.idPeran) {
      await prisma.pegawai_peran.upsert({
        where: {
          idPegawai_idPeran: { idPegawai: peg.idPegawai, idPeran: p.idPeran },
        },
        update: { isPrimary: true },
        create: {
          idPegawai: peg.idPegawai,
          idPeran: p.idPeran,
          isPrimary: true,
        },
      });
    }

    // Akun Login
    await prisma.akun.upsert({
      where: { idPegawai: peg.idPegawai },
      update: {
        username: p.username,
        password: defaultPassword,
        role: p.role,
      },
      create: {
        idPegawai: peg.idPegawai,
        username: p.username,
        password: defaultPassword,
        role: p.role,
      },
    });

    // Rekening Pegawai
    const existingRek = await prisma.rekening_pegawai.findFirst({
      where: { idPegawai: peg.idPegawai },
    });
    if (!existingRek) {
      await prisma.rekening_pegawai.create({
        data: {
          idPegawai: peg.idPegawai,
          namaBank: p.bank,
          nomorRekening: p.rek,
          atasNama: p.nama,
        },
      });
    }
  }
  console.log(`✓ ${pegawaiData.length} Pegawai & Akun siap.`);

  // 4. Buat Jadwal Dinas Mingguan Terintegrasi (Unit Rawat Inap & Nakes)
  // Buat jadwal untuk 7 hari minggu berjalan (Senin s/d Minggu)
  const dayOfWeek = today.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = tambahHari(today, diffToMonday);

  const nakesStaff = [
    { username: 'ayulestari', shiftSeninKamis: 'Shift Pagi', shiftJumatMin: 'Shift Siang' },
    { username: 'ranioktavia', shiftSeninKamis: 'Shift Siang', shiftJumatMin: 'Shift Pagi' },
    { username: 'bimapratama', shiftSeninKamis: 'Shift Malam', shiftJumatMin: 'Shift Malam' },
    { username: 'sitinurhaliza', shiftSeninKamis: 'Shift Pagi', shiftJumatMin: 'Shift Pagi' },
    { username: 'drhendra', shiftSeninKamis: 'Praktik', shiftJumatMin: 'Praktik' },
    { username: 'drdimas', shiftSeninKamis: 'Shift Pagi', shiftJumatMin: 'Shift Siang' },
  ];

  console.log('--- Membuat Roster Jadwal & Presensi Mingguan ---');

  for (let i = 0; i < 7; i++) {
    const shiftDate = tambahHari(monday, i);
    const isWeekend = shiftDate.getUTCDay() === 0 || shiftDate.getUTCDay() === 6;

    for (const ns of nakesStaff) {
      const peg = mapPegawai.get(ns.username);
      if (!peg) continue;

      const jenisShift = i < 4 ? ns.shiftSeninKamis : ns.shiftJumatMin;
      let jamMulaiStr = '07:00:00';
      let jamSelesaiStr = '14:00:00';

      if (jenisShift.includes('Siang')) {
        jamMulaiStr = '14:00:00';
        jamSelesaiStr = '21:00:00';
      } else if (jenisShift.includes('Malam')) {
        jamMulaiStr = '21:00:00';
        jamSelesaiStr = '07:00:00';
      } else if (jenisShift.includes('Praktik')) {
        jamMulaiStr = '08:00:00';
        jamSelesaiStr = '14:00:00';
      }

      // Jangan beri jadwal di weekend untuk dokter anak praktik
      if (isWeekend && jenisShift === 'Praktik') continue;

      let jdw = await prisma.jadwal.findFirst({
        where: { idPegawai: peg.idPegawai, tanggal: shiftDate },
      });

      if (!jdw) {
        jdw = await prisma.jadwal.create({
          data: {
            idPegawai: peg.idPegawai,
            tanggal: shiftDate,
            jamMulai: parseJam(jamMulaiStr),
            jamSelesai: parseJam(jamSelesaiStr),
            jenisJadwal: jenisShift,
          },
        });
      }

      // Buat absensi untuk hari yang sudah lewat atau hari ini
      if (shiftDate <= today) {
        const existingAbs = await prisma.absensi.findFirst({
          where: { idJadwal: jdw.idJadwal },
        });

        if (!existingAbs) {
          const waktuMasuk = new Date(shiftDate);
          waktuMasuk.setUTCHours(Number(jamMulaiStr.slice(0, 2)), 0, 0, 0);

          const waktuPulang = new Date(shiftDate);
          waktuPulang.setUTCHours(Number(jamSelesaiStr.slice(0, 2)), 0, 0, 0);

          // Status kehadiran variatif untuk menguji metrik
          let statusHadir = 'Hadir';
          if (ns.username === 'bimapratama' && i === 2) {
            statusHadir = 'Terlambat';
            waktuMasuk.setUTCMinutes(25); // terlambat 25 menit
          }

          await prisma.absensi.create({
            data: {
              idPegawai: peg.idPegawai,
              idJadwal: jdw.idJadwal,
              tanggal: shiftDate,
              waktuMasuk,
              waktuPulang: shiftDate < today ? waktuPulang : null,
              statusKehadiran: statusHadir,
              statusPulang: shiftDate < today ? 'Sudah Pulang' : null,
            },
          });
        }
      }
    }
  }
  console.log('✓ Jadwal & Absensi mingguan terintegrasi selesai.');

  // 5. Pengajuan Jadwal / Tukar Shift
  const ayu = mapPegawai.get('ayulestari');
  const rani = mapPegawai.get('ranioktavia');
  const bima = mapPegawai.get('bimapratama');
  const drHendra = mapPegawai.get('drhendra');

  if (rani) {
    const jdwRani = await prisma.jadwal.findFirst({
      where: { idPegawai: rani.idPegawai, tanggal: { gte: today } },
    });
    if (jdwRani) {
      const existingReq = await prisma.pengajuan_jadwal.findFirst({
        where: { idPegawai: rani.idPegawai },
      });
      if (!existingReq) {
        await prisma.pengajuan_jadwal.create({
          data: {
            idPegawai: rani.idPegawai,
            idJadwal: jdwRani.idJadwal,
            jenisPengajuan: 'Tukar Shift',
            tanggalBaru: tambahHari(today, 1),
            jamMulaiBaru: parseJam('07:00:00'),
            jamSelesaiBaru: parseJam('14:00:00'),
            alasan: 'Tukar shift dinas malam ke shift siang dengan Bima Pratama',
            status: 'Menunggu',
            sisaJatahCuti: rani.sisaJatahCuti,
          },
        });
        console.log('✓ Pengajuan tukar shift Rani Oktavia dibuat.');
      }
    }
  }

  // 6. Pengajuan Cuti & Surat Hasil Cuti
  if (drHendra) {
    const existingCuti = await prisma.pengajuan_cuti.findFirst({
      where: { idPegawai: drHendra.idPegawai },
    });
    if (!existingCuti) {
      const cuti = await prisma.pengajuan_cuti.create({
        data: {
          idPegawai: drHendra.idPegawai,
          tanggalMulai: tambahHari(today, 5),
          tanggalSelesai: tambahHari(today, 7),
          durasi: 3,
          jenisCuti: 'Cuti Tahunan',
          alasan: 'Kegiatan ilmiah simposium kedokteran anak',
          status: 'DISETUJUI',
          keputusan: 'DISETUJUI',
          catatan: 'Disetujui untuk perwakilan simposium',
        },
      });

      await prisma.surat_hasil_cuti.create({
        data: {
          idPengajuan: cuti.idPengajuan,
          nomorSurat: 'SKC/042/RSIM/XI/2026',
          tanggalTerbit: today,
          keputusan: 'Disetujui',
        },
      });
      console.log('✓ Pengajuan cuti dr. Hendra & Surat Cuti terbit.');
    }
  }

  // 7. Pengajuan Ketidakhadiran (Izin Sakit Ayu Lestari)
  if (ayu) {
    const existingIzin = await prisma.pengajuan_ketidakhadiran.findFirst({
      where: { idPegawai: ayu.idPegawai },
    });
    if (!existingIzin) {
      await prisma.pengajuan_ketidakhadiran.create({
        data: {
          idPegawai: ayu.idPegawai,
          tanggalMulai: tambahHari(today, -2),
          tanggalSelesai: tambahHari(today, -2),
          jenis: 'Izin Sakit',
          alasan: 'Demam dan flu (disertai surat keterangan dokter poli staf)',
          status: 'DISETUJUI',
          catatan: 'Surat dokter terverifikasi',
        },
      });
      console.log('✓ Pengajuan izin sakit Ns. Ayu Lestari dibuat.');
    }
  }

  // 8. Pengajuan Koreksi Absensi (Bima Pratama)
  if (bima) {
    const absBima = await prisma.absensi.findFirst({
      where: { idPegawai: bima.idPegawai },
    });
    if (absBima) {
      const existingKoreksi = await prisma.pengajuan_koreksi.findFirst({
        where: { idAbsensi: absBima.idAbsensi },
      });
      if (!existingKoreksi) {
        await prisma.pengajuan_koreksi.create({
          data: {
            idAbsensi: absBima.idAbsensi,
            waktuMasukBaru: absBima.waktuMasuk,
            waktuPulangBaru: new Date(),
            alasanKoreksi: 'Gagal scan fingerprint saat jam pergantian shift malam',
            status: 'MENUNGGU',
            catatan: 'Menunggu konfirmasi kepala ruangan bangsal',
          },
        });
        console.log('✓ Pengajuan koreksi absensi Bima Pratama dibuat.');
      }
    }
  }

  // 9. Riwayat Penggajian (Periode Aktif 2026-11 dan 4 Periode Lalu 2026-10, 09, 08, 07)
  console.log('--- Membuat Penggajian Multi-Periode & Transaksi Pembayaran ---');
  const periods = ['2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

  for (const [idx, per] of periods.entries()) {
    const isLatest = idx === periods.length - 1; // 2026-11

    for (const p of pegawaiData) {
      const peg = mapPegawai.get(p.username);
      if (!peg) continue;

      const existingGaji = await prisma.penggajian.findFirst({
        where: { idPegawai: peg.idPegawai, periodeGaji: per },
      });

      if (!existingGaji) {
        // Ambil nominal pedoman
        let gapok = 5000000;
        let tunjangan = 1000000;
        let potongan = 150000;

        if (p.idPeran) {
          const ped = await prisma.pedoman_penggajian.findFirst({
            where: { idPeran: p.idPeran },
          });
          if (ped) {
            gapok = Number(ped.gajiPokok);
            tunjangan = Number(ped.tunjanganJabatan) + 250000; // tunjangan kehadiran
            potongan = Number(ped.potonganTidakHadirPerHari) > 0 ? 120000 : 80000;
          }
        } else if (p.role === 'Manajemen Keuangan') {
          gapok = 9500000;
          tunjangan = 2500000;
        } else if (p.role === 'HRD') {
          gapok = 7500000;
          tunjangan = 1800000;
        } else if (p.role === 'Sekretaris Unit') {
          gapok = 4800000;
          tunjangan = 1200000;
        }

        const total = gapok + tunjangan - potongan;
        const statusBayar = isLatest ? 'Lunas' : 'Terbayar';

        const gji = await prisma.penggajian.create({
          data: {
            idPegawai: peg.idPegawai,
            periodeGaji: per,
            gajiPokok: gapok,
            tunjangan,
            potongan,
            totalGaji: total,
            statusPembayaran: statusBayar,
          },
        });

        // Buat record transaksi_pembayaran
        const rek = await prisma.rekening_pegawai.findFirst({
          where: { idPegawai: peg.idPegawai },
        });
        if (rek) {
          await prisma.transaksi_pembayaran.create({
            data: {
              idPegawai: peg.idPegawai,
              idRekening: rek.idRekening,
              nominal: total,
              jenisTransaksi: 'Disbursement Payroll',
              status: 'Berhasil',
              tanggalTransaksi: new Date(`${per}-25T09:00:00Z`),
            },
          });
        }
      }
    }
  }
  console.log('✓ Penggajian multi-periode & transaksi kliring terisi.');

  // 10. Pengajuan Banding Gaji Terintegrasi
  if (ayu) {
    const existingBdg = await prisma.pengajuan_banding_gaji.findFirst({
      where: { idPegawai: ayu.idPegawai, periodeGaji: '2026-10' },
    });
    if (!existingBdg) {
      await prisma.pengajuan_banding_gaji.create({
        data: {
          idPegawai: ayu.idPegawai,
          periodeGaji: '2026-10',
          alasanBanding: 'Tunjangan shift malam 4 hari belum masuk ke slip payroll periode Oktober',
          status: 'DIPROSES',
          keputusan: null,
        },
      });
      console.log('✓ Banding gaji Ns. Ayu Lestari dibuat.');
    }
  }

  if (bima) {
    const existingBdg = await prisma.pengajuan_banding_gaji.findFirst({
      where: { idPegawai: bima.idPegawai, periodeGaji: '2026-10' },
    });
    if (!existingBdg) {
      await prisma.pengajuan_banding_gaji.create({
        data: {
          idPegawai: bima.idPegawai,
          periodeGaji: '2026-10',
          alasanBanding: 'Koreksi potongan absensi terlambat yang telah disetujui sebelumnya',
          status: 'DISETUJUI',
          keputusan: 'DISETUJUI',
        },
      });
      console.log('✓ Banding gaji Bima Pratama disetujui dibuat.');
    }
  }

  console.log('======================================================');
  console.log('🎉 SEEDING DATA TERINTEGRASI BERHASIL 100%! 🎉');
  console.log('Akun siap digunakan (Password default: password123):');
  console.log('  1. HRD:               athaya');
  console.log('  2. Manajemen Keuangan: bambang');
  console.log('  3. Sekretaris Unit:   rizky');
  console.log('  4. Tenaga Medis:      ayulestari (Perawat)');
  console.log('  5. Tenaga Medis:      drhendra (Dokter Spesialis)');
  console.log('  6. Tenaga Medis:      bimapratama (Perawat)');
  console.log('======================================================');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
