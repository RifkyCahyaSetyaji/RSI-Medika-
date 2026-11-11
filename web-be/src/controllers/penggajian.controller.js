import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';
import { sekarang } from '../utils/jadwal.js';
import {
  STATUS_PEMBAYARAN,
  cariPedomanBerlaku,
  hitungKomponenGaji,
  periodeSekarang,
  rekapKehadiranBulanan,
  rentangPeriode,
  serializeGaji,
} from '../services/penggajian.service.js';

const includeGaji = {
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

const fmtWaktu = (d) => (d ? d.toISOString().slice(0, 19).replace('T', ' ') : null);

/** Susun rincian lengkap slip gaji (metrik absensi + rincian tunjangan & potongan). */
async function susunRincianSlip(gaji) {
  const metrik = await rekapKehadiranBulanan(gaji.idPegawai, gaji.periodeGaji);
  const pedoman =
    gaji.pedoman_penggajian ?? (await cariPedomanBerlaku(gaji.pegawai?.peran_tenaga_medis?.idPeran, gaji.periodeGaji));

  let rincian = null;
  if (pedoman) {
    const dasar = hitungKomponenGaji(pedoman, metrik);
    // jika nilai tunjangan/potongan di DB pernah disesuaikan (mis. hasil banding), tampilkan selisihnya
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

/** GET /api/penggajian/saya?periode= — daftar slip gaji milik pegawai yang login. */
export const gajiSaya = asyncHandler(async (req, res) => {
  const { periode } = req.query;
  if (periode) rentangPeriode(periode);

  const list = await prisma.penggajian.findMany({
    where: { idPegawai: req.user.idPegawai, ...(periode && { periodeGaji: periode }) },
    include: includeGaji,
    orderBy: { periodeGaji: 'desc' },
  });

  const data = await Promise.all(list.map(susunRincianSlip));
  res.json({ success: true, data });
});

/** GET /api/penggajian?periode=&statusPembayaran=&idPegawai= — HRD & Manajemen Keuangan. */
export const daftarGaji = asyncHandler(async (req, res) => {
  const { periode, statusPembayaran, idPegawai } = req.query;
  if (periode) rentangPeriode(periode);

  const list = await prisma.penggajian.findMany({
    where: {
      ...(periode && { periodeGaji: periode }),
      ...(statusPembayaran && { statusPembayaran }),
      ...(idPegawai && { idPegawai }),
    },
    include: includeGaji,
    orderBy: [{ periodeGaji: 'desc' }, { idGaji: 'desc' }],
  });

  res.json({ success: true, data: list.map((g) => serializeGaji(g)) });
});

/** GET /api/penggajian/:idGaji — detail slip gaji lengkap (pemilik, HRD, Manajemen Keuangan). */
export const detailGaji = asyncHandler(async (req, res) => {
  const g = await prisma.penggajian.findUnique({
    where: { idGaji: req.params.idGaji },
    include: includeGaji,
  });
  if (!g) throw new ApiError(404, 'Data penggajian tidak ditemukan');

  const pengelola = [ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN].includes(req.user.role);
  if (!pengelola && g.idPegawai !== req.user.idPegawai) {
    throw new ApiError(403, 'Anda tidak memiliki akses ke slip gaji ini');
  }

  const transaksi = await prisma.transaksi_pembayaran.findMany({
    where: { idPegawai: g.idPegawai, jenisTransaksi: `Gaji ${g.periodeGaji}` },
    include: { rekening_pegawai: true },
    orderBy: { tanggalTransaksi: 'desc' },
  });

  const slip = await susunRincianSlip(g);
  res.json({
    success: true,
    data: {
      ...slip,
      transaksiPembayaran: transaksi.map((t) => ({
        ...t,
        nominal: Number(t.nominal),
        tanggalTransaksi: fmtWaktu(t.tanggalTransaksi),
      })),
    },
  });
});

/**
 * Hitung & simpan (upsert) gaji 1 pegawai untuk suatu periode.
 */
async function prosesHitungPegawai(pegawai, periode, inputManual = {}) {
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

/**
 * POST /api/penggajian/hitung — hitung/generate gaji 1 pegawai pada suatu periode.
 * body: { idPegawai, periodeGaji?, nilaiJasaMedis?, tunjanganTambahan?, potonganTambahan?, ...overrideMetrik }
 */
export const hitungGajiPegawai = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { idPegawai } = body;
  const periode = body.periodeGaji || periodeSekarang();
  if (!idPegawai) throw new ApiError(400, 'idPegawai wajib diisi');
  rentangPeriode(periode);

  const pegawai = await prisma.pegawai.findUnique({
    where: { idPegawai },
    include: { peran_tenaga_medis: true },
  });
  if (!pegawai) throw new ApiError(404, 'Pegawai tidak ditemukan');

  const data = await prosesHitungPegawai(pegawai, periode, body);
  res.status(201).json({ success: true, message: `Gaji ${pegawai.nama} periode ${periode} berhasil dihitung`, data });
});

/**
 * POST /api/penggajian/hitung-bulk — generate gaji seluruh pegawai aktif yang punya peran pada suatu periode.
 * body: { periodeGaji?, idPegawai?: [..] }
 */
export const hitungGajiBulk = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const periode = body.periodeGaji || periodeSekarang();
  rentangPeriode(periode);

  const pegawaiList = await prisma.pegawai.findMany({
    where: {
      statusPegawai: 'Aktif',
      idPeran: { not: null },
      ...(Array.isArray(body.idPegawai) && body.idPegawai.length > 0 && { idPegawai: { in: body.idPegawai } }),
    },
    include: { peran_tenaga_medis: true },
    orderBy: { nama: 'asc' },
  });

  const berhasil = [];
  const dilewati = [];

  for (const p of pegawaiList) {
    try {
      const g = await prosesHitungPegawai(p, periode);
      berhasil.push(g);
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      dilewati.push({ idPegawai: p.idPegawai, nama: p.nama, alasan: err.message });
    }
  }

  res.status(201).json({
    success: true,
    message: `${berhasil.length} slip gaji periode ${periode} berhasil dihitung`,
    data: { periode, jumlahBerhasil: berhasil.length, jumlahDilewati: dilewati.length, berhasil, dilewati },
  });
});

/**
 * POST /api/penggajian/:idGaji/bayar — Manajemen Keuangan mencairkan gaji ke rekening pegawai.
 * body opsional: { idRekening } (jika kosong, otomatis pakai rekening pertama milik pegawai).
 */
export const bayarGaji = asyncHandler(async (req, res) => {
  const gaji = await prisma.penggajian.findUnique({
    where: { idGaji: req.params.idGaji },
    include: { pegawai: { include: { rekening_pegawai: true } } },
  });
  if (!gaji) throw new ApiError(404, 'Data penggajian tidak ditemukan');
  if (gaji.statusPembayaran === STATUS_PEMBAYARAN.TERBAYAR) {
    throw new ApiError(409, 'Gaji ini sudah berstatus Terbayar');
  }
  if (Number(gaji.totalGaji) <= 0) {
    throw new ApiError(400, 'Total gaji 0, tidak dapat membuat transaksi pembayaran');
  }

  const rekeningList = gaji.pegawai.rekening_pegawai;
  if (rekeningList.length === 0) {
    throw new ApiError(400, `Pegawai ${gaji.pegawai.nama} belum memiliki data rekening bank`);
  }

  const { idRekening } = req.body || {};
  const rekening = idRekening ? rekeningList.find((r) => r.idRekening === idRekening) : rekeningList[0];
  if (!rekening) throw new ApiError(404, 'Rekening tidak ditemukan pada pegawai ini');

  const now = sekarang();
  const [updatedGaji, transaksi] = await prisma.$transaction([
    prisma.penggajian.update({
      where: { idGaji: gaji.idGaji },
      data: { statusPembayaran: STATUS_PEMBAYARAN.TERBAYAR },
      include: includeGaji,
    }),
    prisma.transaksi_pembayaran.create({
      data: {
        idPegawai: gaji.idPegawai,
        idRekening: rekening.idRekening,
        nominal: gaji.totalGaji,
        jenisTransaksi: `Gaji ${gaji.periodeGaji}`,
        status: 'Berhasil',
        tanggalTransaksi: now,
      },
      include: { rekening_pegawai: true },
    }),
  ]);

  res.json({
    success: true,
    message: `Gaji ${gaji.pegawai.nama} periode ${gaji.periodeGaji} berhasil dibayarkan`,
    data: {
      gaji: serializeGaji(updatedGaji),
      transaksi: {
        ...transaksi,
        nominal: Number(transaksi.nominal),
        tanggalTransaksi: fmtWaktu(transaksi.tanggalTransaksi),
      },
    },
  });
});

/**
 * POST /api/penggajian/bayar-bulk — bayar semua gaji yang belum terbayar pada suatu periode.
 * body: { periodeGaji }
 */
export const bayarGajiBulk = asyncHandler(async (req, res) => {
  const { periodeGaji } = req.body || {};
  if (!periodeGaji) throw new ApiError(400, 'periodeGaji wajib diisi');
  rentangPeriode(periodeGaji);

  const list = await prisma.penggajian.findMany({
    where: { periodeGaji, statusPembayaran: { not: STATUS_PEMBAYARAN.TERBAYAR } },
    include: { pegawai: { include: { rekening_pegawai: true } } },
  });

  const dibayar = [];
  const dilewati = [];
  const now = sekarang();

  for (const g of list) {
    const rek = g.pegawai.rekening_pegawai[0];
    if (!rek) {
      dilewati.push({ idGaji: g.idGaji, nama: g.pegawai.nama, alasan: 'Belum memiliki rekening bank' });
      continue;
    }
    if (Number(g.totalGaji) <= 0) {
      dilewati.push({ idGaji: g.idGaji, nama: g.pegawai.nama, alasan: 'Total gaji 0' });
      continue;
    }

    const [updated] = await prisma.$transaction([
      prisma.penggajian.update({
        where: { idGaji: g.idGaji },
        data: { statusPembayaran: STATUS_PEMBAYARAN.TERBAYAR },
      }),
      prisma.transaksi_pembayaran.create({
        data: {
          idPegawai: g.idPegawai,
          idRekening: rek.idRekening,
          nominal: g.totalGaji,
          jenisTransaksi: `Gaji ${g.periodeGaji}`,
          status: 'Berhasil',
          tanggalTransaksi: now,
        },
      }),
    ]);
    dibayar.push(serializeGaji(updated));
  }

  res.json({
    success: true,
    message: `${dibayar.length} gaji periode ${periodeGaji} berhasil dibayarkan`,
    data: { jumlahDibayar: dibayar.length, jumlahDilewati: dilewati.length, dibayar, dilewati },
  });
});

/** GET /api/penggajian/transaksi/riwayat?idPegawai= — riwayat pembayaran gaji. */
export const riwayatTransaksi = asyncHandler(async (req, res) => {
  const pengelola = [ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN].includes(req.user.role);
  const where = pengelola
    ? { ...(req.query.idPegawai && { idPegawai: req.query.idPegawai }) }
    : { idPegawai: req.user.idPegawai };

  const list = await prisma.transaksi_pembayaran.findMany({
    where,
    include: {
      pegawai: { select: { idPegawai: true, nama: true, unitKerja: true } },
      rekening_pegawai: true,
    },
    orderBy: { tanggalTransaksi: 'desc' },
  });

  res.json({
    success: true,
    data: list.map((t) => ({
      ...t,
      nominal: Number(t.nominal),
      tanggalTransaksi: fmtWaktu(t.tanggalTransaksi),
    })),
  });
});

// =====================================================================
// REKENING PEGAWAI
// =====================================================================

/** GET /api/penggajian/rekening/saya */
export const rekeningSaya = asyncHandler(async (req, res) => {
  const data = await prisma.rekening_pegawai.findMany({
    where: { idPegawai: req.user.idPegawai },
    orderBy: { idRekening: 'asc' },
  });
  res.json({ success: true, data });
});

/** POST /api/penggajian/rekening — body: { namaBank, nomorRekening, atasNama, idPegawai? (khusus HRD/Keuangan) } */
export const tambahRekening = asyncHandler(async (req, res) => {
  const { namaBank, nomorRekening, atasNama, idPegawai } = req.body || {};
  if (!namaBank?.trim() || !nomorRekening?.trim() || !atasNama?.trim()) {
    throw new ApiError(400, 'namaBank, nomorRekening, dan atasNama wajib diisi');
  }

  const pengelola = [ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN].includes(req.user.role);
  const targetPegawai = pengelola && idPegawai ? idPegawai : req.user.idPegawai;

  const data = await prisma.rekening_pegawai.create({
    data: {
      idPegawai: targetPegawai,
      namaBank: namaBank.trim(),
      nomorRekening: nomorRekening.trim(),
      atasNama: atasNama.trim(),
    },
  });
  res.status(201).json({ success: true, message: 'Rekening berhasil ditambahkan', data });
});

/** DELETE /api/penggajian/rekening/:idRekening */
export const hapusRekening = asyncHandler(async (req, res) => {
  const rek = await prisma.rekening_pegawai.findUnique({ where: { idRekening: req.params.idRekening } });
  if (!rek) throw new ApiError(404, 'Rekening tidak ditemukan');

  const pengelola = [ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN].includes(req.user.role);
  if (!pengelola && rek.idPegawai !== req.user.idPegawai) {
    throw new ApiError(403, 'Anda tidak berhak menghapus rekening ini');
  }

  const dipakai = await prisma.transaksi_pembayaran.count({ where: { idRekening: rek.idRekening } });
  if (dipakai > 0) {
    throw new ApiError(400, 'Rekening sudah memiliki riwayat transaksi pembayaran dan tidak bisa dihapus');
  }

  await prisma.rekening_pegawai.delete({ where: { idRekening: rek.idRekening } });
  res.json({ success: true, message: 'Rekening dihapus' });
});
