import prisma from '../config/prisma.js';
import { ApiError } from '../utils/http.js';
import { durasiJam, hariIni, isLembur, sekarang } from '../utils/jadwal.js';
import { KEHADIRAN, KEHADIRAN_BERIZIN, batasJadwal } from './absensi.service.js';

export const RE_PERIODE = /^[0-9]{4}-(0[1-9]|1[0-2])$/;

export const STATUS_PEMBAYARAN = Object.freeze({
  BELUM_DIBAYAR: 'Belum Dibayar',
  DIPROSES: 'Diproses',
  TERBAYAR: 'Terbayar',
});

export const STATUS_BANDING = Object.freeze({
  MENUNGGU: 'Menunggu',
  DIPROSES: 'Diproses',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
  DIBATALKAN: 'Dibatalkan',
});

export const includeGaji = {
  pegawai: {
    select: {
      idPegawai: true,
      nama: true,
      nip: true,
      jabatan: true,
      unitKerja: true,
      peran_tenaga_medis: { select: { idPeran: true, namaPeran: true, kategori: true } },
      rekening_pegawai: true,
    },
  },
  pedoman_penggajian: true,
};

const num = (v) => Number(v ?? 0);
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** 'YYYY-MM' -> { awal: Date, akhir: Date } dalam UTC tengah malam. */
export function rentangPeriode(periode) {
  if (typeof periode !== 'string' || !RE_PERIODE.test(periode)) {
    throw new ApiError(400, 'Format periodeGaji harus YYYY-MM (contoh: 2026-11)');
  }
  const [y, m] = periode.split('-').map(Number);
  const awal = new Date(Date.UTC(y, m - 1, 1));
  const akhir = new Date(Date.UTC(y, m, 0));
  return { awal, akhir };
}

/** Periode berjalan ('YYYY-MM') berdasarkan waktu WIB. */
export function periodeSekarang() {
  return hariIni().toISOString().slice(0, 7);
}

/** Cari pedoman penggajian yang berlaku untuk suatu peran pada periode tertentu. */
export async function cariPedomanBerlaku(idPeran, periode, client = prisma) {
  if (!idPeran) return null;
  const { awal, akhir } = rentangPeriode(periode);
  return client.pedoman_penggajian.findFirst({
    where: {
      idPeran,
      berlakuMulai: { lte: akhir },
      OR: [{ berlakuSampai: null }, { berlakuSampai: { gte: awal } }],
    },
    orderBy: { berlakuMulai: 'desc' },
  });
}

/**
 * Rekap otomatis kehadiran & lembur pegawai pada satu periode ('YYYY-MM')
 * dari tabel jadwal + absensi.
 */
export async function rekapKehadiranBulanan(idPegawai, periode, client = prisma) {
  const { awal, akhir } = rentangPeriode(periode);
  const jadwalList = await client.jadwal.findMany({
    where: { idPegawai, tanggal: { gte: awal, lte: akhir } },
    include: { absensi: true },
  });

  const now = sekarang();
  let hariHadir = 0;
  let jumlahTerlambat = 0;
  let jumlahShiftMalam = 0;
  let jamLembur = 0;
  let hariAlpa = 0;
  let hariCutiIzin = 0;

  for (const j of jadwalList) {
    const abs = j.absensi[0];
    const lembur = isLembur(j.jenisJadwal);
    const hadir = abs && (abs.statusKehadiran === KEHADIRAN.HADIR || abs.statusKehadiran === KEHADIRAN.TERLAMBAT || abs.waktuMasuk);

    if (lembur) {
      if (hadir) {
        const jamAktual =
          abs.waktuMasuk && abs.waktuPulang
            ? Math.max(0, (abs.waktuPulang - abs.waktuMasuk) / 3600000)
            : durasiJam(j);
        jamLembur += Math.min(jamAktual, durasiJam(j));
      }
      continue;
    }

    if (hadir) {
      hariHadir++;
      if (abs.statusKehadiran === KEHADIRAN.TERLAMBAT) jumlahTerlambat++;
      if (/malam/i.test(j.jenisJadwal)) jumlahShiftMalam++;
    } else if (KEHADIRAN_BERIZIN.includes(abs?.statusKehadiran)) {
      hariCutiIzin++;
    } else if (abs?.statusKehadiran === KEHADIRAN.TIDAK_HADIR || batasJadwal(j).selesai < now) {
      hariAlpa++;
    }
  }

  return {
    totalJadwalReguler: jadwalList.filter((j) => !isLembur(j.jenisJadwal)).length,
    hariHadir,
    jumlahTerlambat,
    jumlahShiftMalam,
    jamLembur: round2(jamLembur),
    hariAlpa,
    hariCutiIzin,
  };
}

/** Hitung rincian komponen gaji sesuai rumus fungsi SQL `hitung_gaji_tenaga_medis`. */
export function hitungKomponenGaji(pedoman, metrik = {}) {
  const jumlahShiftMalam = Math.max(0, Number(metrik.jumlahShiftMalam ?? 0));
  const jamLembur = Math.max(0, Number(metrik.jamLembur ?? 0));
  const hariHadir = Math.max(0, Number(metrik.hariHadir ?? 0));
  const nilaiJasaMedis = Math.max(0, Number(metrik.nilaiJasaMedis ?? 0));
  const hariAlpa = Math.max(0, Number(metrik.hariAlpa ?? 0));
  const jumlahTerlambat = Math.max(0, Number(metrik.jumlahTerlambat ?? 0));
  const tunjanganTambahan = Number(metrik.tunjanganTambahan ?? 0);
  const potonganTambahan = Number(metrik.potonganTambahan ?? 0);

  const gajiPokok = num(pedoman.gajiPokok);
  const tunjanganJabatan = num(pedoman.tunjanganJabatan);
  const tunjanganShiftMalam = round2(jumlahShiftMalam * num(pedoman.tunjanganShiftMalam));
  const uangLembur = round2(jamLembur * num(pedoman.uangLemburPerJam));
  const tunjanganKehadiran = round2(hariHadir * num(pedoman.tunjanganKehadiranPerHari));
  const insentifJasaMedis = round2((nilaiJasaMedis * num(pedoman.persenInsentifJasaMedis)) / 100);

  const tunjangan = Math.max(
    0,
    round2(tunjanganJabatan + tunjanganShiftMalam + uangLembur + tunjanganKehadiran + insentifJasaMedis + tunjanganTambahan),
  );

  const potonganTidakHadir = round2(hariAlpa * num(pedoman.potonganTidakHadirPerHari));
  const potonganTerlambat = round2(jumlahTerlambat * num(pedoman.potonganTerlambatPerKejadian));
  const potongan = Math.max(0, round2(potonganTidakHadir + potonganTerlambat + potonganTambahan));

  const totalPendapatan = round2(gajiPokok + tunjangan);
  const totalGaji = Math.max(0, round2(totalPendapatan - potongan));

  return {
    idPedoman: pedoman.idPedoman,
    gajiPokok,
    rincianTunjangan: {
      tunjanganJabatan,
      tunjanganShiftMalam,
      uangLembur,
      tunjanganKehadiran,
      insentifJasaMedis,
      tunjanganTambahan: round2(tunjanganTambahan),
    },
    tunjangan,
    rincianPotongan: {
      potonganTidakHadir,
      potonganTerlambat,
      potonganTambahan: round2(potonganTambahan),
    },
    potongan,
    totalPendapatan,
    totalGaji,
  };
}

export function serializePedoman(p) {
  if (!p) return null;
  return {
    ...p,
    gajiPokok: num(p.gajiPokok),
    tunjanganJabatan: num(p.tunjanganJabatan),
    tunjanganShiftMalam: num(p.tunjanganShiftMalam),
    uangLemburPerJam: num(p.uangLemburPerJam),
    tunjanganKehadiranPerHari: num(p.tunjanganKehadiranPerHari),
    persenInsentifJasaMedis: num(p.persenInsentifJasaMedis),
    potonganTidakHadirPerHari: num(p.potonganTidakHadirPerHari),
    potonganTerlambatPerKejadian: num(p.potonganTerlambatPerKejadian),
    berlakuMulai: p.berlakuMulai?.toISOString().slice(0, 10) ?? null,
    berlakuSampai: p.berlakuSampai?.toISOString().slice(0, 10) ?? null,
  };
}

export function serializeGaji(g, ekstra = {}) {
  if (!g) return null;
  const gajiPokok = num(g.gajiPokok);
  const tunjangan = num(g.tunjangan);
  const potongan = num(g.potongan);
  const totalGaji = num(g.totalGaji);
  return {
    ...g,
    gajiPokok,
    tunjangan,
    potongan,
    totalPendapatan: round2(gajiPokok + tunjangan),
    totalGaji,
    ...(g.pedoman_penggajian && { pedoman_penggajian: serializePedoman(g.pedoman_penggajian) }),
    ...ekstra,
  };
}

/** Susun rincian lengkap slip gaji (metrik absensi + rincian tunjangan & potongan). */
export async function susunRincianSlip(gaji) {
  const metrik = await rekapKehadiranBulanan(gaji.idPegawai, gaji.periodeGaji);
  const pedoman =
    gaji.pedoman_penggajian ?? (await cariPedomanBerlaku(gaji.pegawai?.peran_tenaga_medis?.idPeran, gaji.periodeGaji));

  let rincian = null;
  if (pedoman) {
    const dasar = hitungKomponenGaji(pedoman, metrik);
    const selisihTunjangan = Number(gaji.tunjangan) - dasar.tunjangan;
    const selisihPotongan = Number(gaji.potongan) - dasar.potongan;
    rincian = hitungKomponenGaji(pedoman, {
      ...metrik,
      tunjanganTambahan: selisihTunjangan,
      potonganTambahan: selisihPotongan,
    });
  }

  return serializeGaji(gaji, {
    metrikKehadiran: metrik,
    rincianTunjangan: rincian?.rincianTunjangan ?? null,
    rincianPotongan: rincian?.rincianPotongan ?? null,
  });
}

/** Hitung & simpan (upsert) gaji 1 pegawai untuk suatu periode. */
export async function prosesHitungPegawai(pegawai, periode, inputManual = {}) {
  if (!pegawai.idPeran) {
    throw new ApiError(400, `Pegawai ${pegawai.nama} belum memiliki peran tenaga medis (idPeran kosong)`);
  }
  const pedoman = await cariPedomanBerlaku(pegawai.idPeran, periode);
  if (!pedoman) {
    throw new ApiError(
      400,
      `Belum ada pedoman penggajian yang berlaku untuk peran ${pegawai.peran_tenaga_medis?.namaPeran ?? pegawai.idPeran} pada periode ${periode}`,
    );
  }

  const existing = await prisma.penggajian.findFirst({
    where: { idPegawai: pegawai.idPegawai, periodeGaji: periode },
  });
  if (existing?.statusPembayaran === STATUS_PEMBAYARAN.TERBAYAR) {
    throw new ApiError(409, `Gaji ${pegawai.nama} periode ${periode} sudah berstatus Terbayar dan tidak bisa dihitung ulang`);
  }

  const otomatis = await rekapKehadiranBulanan(pegawai.idPegawai, periode);
  const metrik = {
    ...otomatis,
    ...(inputManual.jumlahShiftMalam != null && { jumlahShiftMalam: inputManual.jumlahShiftMalam }),
    ...(inputManual.jamLembur != null && { jamLembur: inputManual.jamLembur }),
    ...(inputManual.hariHadir != null && { hariHadir: inputManual.hariHadir }),
    ...(inputManual.hariAlpa != null && { hariAlpa: inputManual.hariAlpa }),
    ...(inputManual.jumlahTerlambat != null && { jumlahTerlambat: inputManual.jumlahTerlambat }),
    nilaiJasaMedis: inputManual.nilaiJasaMedis ?? 0,
    tunjanganTambahan: inputManual.tunjanganTambahan ?? 0,
    potonganTambahan: inputManual.potonganTambahan ?? 0,
  };

  const hasil = hitungKomponenGaji(pedoman, metrik);

  const payload = {
    idPegawai: pegawai.idPegawai,
    periodeGaji: periode,
    idPedoman: pedoman.idPedoman,
    gajiPokok: hasil.gajiPokok,
    tunjangan: hasil.tunjangan,
    potongan: hasil.potongan,
    totalGaji: hasil.totalGaji,
    statusPembayaran: existing?.statusPembayaran ?? STATUS_PEMBAYARAN.BELUM_DIBAYAR,
  };

  const record = existing
    ? await prisma.penggajian.update({ where: { idGaji: existing.idGaji }, data: payload, include: includeGaji })
    : await prisma.penggajian.create({ data: payload, include: includeGaji });

  return serializeGaji(record, {
    metrikKehadiran: metrik,
    rincianTunjangan: hasil.rincianTunjangan,
    rincianPotongan: hasil.rincianPotongan,
  });
}
