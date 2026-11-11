import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';
import { sekarang } from '../utils/jadwal.js';
import {
  STATUS_PEMBAYARAN,
  includeGaji,
  rentangPeriode,
  serializeGaji,
} from '../services/penggajian.service.js';

const fmtWaktu = (d) => (d ? d.toISOString().slice(0, 19).replace('T', ' ') : null);

/**
 * POST /api/penggajian/:idGaji/bayar — Manajemen Keuangan / HRD mencairkan gaji ke rekening pegawai.
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

