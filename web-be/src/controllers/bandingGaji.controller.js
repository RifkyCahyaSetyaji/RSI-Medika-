import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';
import {
  STATUS_BANDING,
  STATUS_PEMBAYARAN,
  rentangPeriode,
  serializeGaji,
} from '../services/penggajian.service.js';

const includeDetail = {
  pegawai: {
    select: {
      idPegawai: true,
      nama: true,
      nip: true,
      jabatan: true,
      unitKerja: true,
      peran_tenaga_medis: { select: { idPeran: true, namaPeran: true } },
    },
  },
};

async function lampirkanSlip(banding) {
  if (!banding) return null;
  const gaji = await prisma.penggajian.findFirst({
    where: { idPegawai: banding.idPegawai, periodeGaji: banding.periodeGaji },
  });
  return { ...banding, penggajian: serializeGaji(gaji) };
}

/**
 * POST /api/banding-gaji — pegawai mengajukan banding atas slip gajinya.
 * body: { periodeGaji, alasanBanding, buktiPendukung? }
 */
export const ajukanBanding = asyncHandler(async (req, res) => {
  const { periodeGaji, alasanBanding, buktiPendukung } = req.body || {};
  if (!periodeGaji || !alasanBanding?.trim()) {
    throw new ApiError(400, 'periodeGaji dan alasanBanding wajib diisi');
  }
  rentangPeriode(periodeGaji);
  if (alasanBanding.length > 255) throw new ApiError(400, 'alasanBanding maksimal 255 karakter');
  if (buktiPendukung && String(buktiPendukung).length > 255) {
    throw new ApiError(400, 'buktiPendukung maksimal 255 karakter');
  }

  const gaji = await prisma.penggajian.findFirst({
    where: { idPegawai: req.user.idPegawai, periodeGaji },
  });
  if (!gaji) {
    throw new ApiError(404, `Slip gaji periode ${periodeGaji} belum tersedia untuk akun Anda`);
  }

  const aktif = await prisma.pengajuan_banding_gaji.findFirst({
    where: {
      idPegawai: req.user.idPegawai,
      periodeGaji,
      status: { in: [STATUS_BANDING.MENUNGGU, STATUS_BANDING.DIPROSES] },
    },
  });
  if (aktif) {
    throw new ApiError(409, `Masih ada pengajuan banding periode ${periodeGaji} yang sedang ${aktif.status}`);
  }

  const created = await prisma.pengajuan_banding_gaji.create({
    data: {
      idPegawai: req.user.idPegawai,
      periodeGaji,
      alasanBanding: alasanBanding.trim(),
      buktiPendukung: buktiPendukung || null,
      status: STATUS_BANDING.MENUNGGU,
    },
    include: includeDetail,
  });

  res.status(201).json({
    success: true,
    message: 'Pengajuan banding gaji berhasil dikirim ke HRD & Manajemen Keuangan',
    data: await lampirkanSlip(created),
  });
});

/** GET /api/banding-gaji/saya?periode=&status= */
export const bandingSaya = asyncHandler(async (req, res) => {
  const { periode, status } = req.query;
  if (periode) rentangPeriode(periode);

  const list = await prisma.pengajuan_banding_gaji.findMany({
    where: {
      idPegawai: req.user.idPegawai,
      ...(periode && { periodeGaji: periode }),
      ...(status && { status }),
    },
    include: includeDetail,
    orderBy: { idPengajuan: 'desc' },
  });

  const data = await Promise.all(list.map(lampirkanSlip));
  res.json({ success: true, data });
});

/** GET /api/banding-gaji?periode=&status= — HRD & Manajemen Keuangan. */
export const daftarBanding = asyncHandler(async (req, res) => {
  const { periode, status } = req.query;
  if (periode) rentangPeriode(periode);

  const list = await prisma.pengajuan_banding_gaji.findMany({
    where: {
      ...(periode && { periodeGaji: periode }),
      ...(status && { status }),
    },
    include: includeDetail,
    orderBy: { idPengajuan: 'desc' },
  });

  const data = await Promise.all(list.map(lampirkanSlip));
  res.json({ success: true, data });
});

/** GET /api/banding-gaji/:idPengajuan */
export const detailBanding = asyncHandler(async (req, res) => {
  const b = await prisma.pengajuan_banding_gaji.findUnique({
    where: { idPengajuan: req.params.idPengajuan },
    include: includeDetail,
  });
  if (!b) throw new ApiError(404, 'Pengajuan banding tidak ditemukan');

  const pengelola = [ROLES.HRD, ROLES.MANAJEMEN_KEUANGAN].includes(req.user.role);
  if (!pengelola && b.idPegawai !== req.user.idPegawai) {
    throw new ApiError(403, 'Anda tidak memiliki akses ke pengajuan ini');
  }

  res.json({ success: true, data: await lampirkanSlip(b) });
});

/**
 * PATCH /api/banding-gaji/:idPengajuan/proses — HRD / Manajemen Keuangan memproses banding.
 * body: {
 *   status: 'Diproses' | 'Disetujui' | 'Ditolak',
 *   keputusan?: string,
 *   tunjanganBaru?: number,
 *   potonganBaru?: number,
 *   selisihTunjangan?: number, // mis. +350000
 *   selisihPotongan?: number   // mis. -120000
 * }
 * Jika status = 'Disetujui' dan ada perubahan tunjangan/potongan, slip gaji periode tersebut ikut diperbarui.
 */
export const prosesBanding = asyncHandler(async (req, res) => {
  const { status, keputusan, tunjanganBaru, potonganBaru, selisihTunjangan, selisihPotongan } = req.body || {};
  const validStatus = [STATUS_BANDING.DIPROSES, STATUS_BANDING.DISETUJUI, STATUS_BANDING.DITOLAK];
  if (!validStatus.includes(status)) {
    throw new ApiError(400, `status harus salah satu dari: ${validStatus.join(', ')}`);
  }
  if (keputusan && String(keputusan).length > 20) {
    throw new ApiError(400, 'keputusan maksimal 20 karakter');
  }

  const b = await prisma.pengajuan_banding_gaji.findUnique({
    where: { idPengajuan: req.params.idPengajuan },
  });
  if (!b) throw new ApiError(404, 'Pengajuan banding tidak ditemukan');
  if ([STATUS_BANDING.DISETUJUI, STATUS_BANDING.DITOLAK, STATUS_BANDING.DIBATALKAN].includes(b.status)) {
    throw new ApiError(400, `Pengajuan sudah selesai dengan status ${b.status}`);
  }

  const adaKoreksiNominal =
    tunjanganBaru != null || potonganBaru != null || selisihTunjangan != null || selisihPotongan != null;

  const updated = await prisma.$transaction(async (tx) => {
    if (status === STATUS_BANDING.DISETUJUI && adaKoreksiNominal) {
      const gaji = await tx.penggajian.findFirst({
        where: { idPegawai: b.idPegawai, periodeGaji: b.periodeGaji },
      });
      if (!gaji) throw new ApiError(404, 'Slip gaji terkait tidak ditemukan');
      if (gaji.statusPembayaran === STATUS_PEMBAYARAN.TERBAYAR) {
        throw new ApiError(409, 'Slip gaji sudah Terbayar sehingga nominalnya tidak bisa diubah langsung');
      }

      const tunjangan =
        tunjanganBaru != null
          ? Number(tunjanganBaru)
          : Number(gaji.tunjangan) + Number(selisihTunjangan ?? 0);
      const potongan =
        potonganBaru != null
          ? Number(potonganBaru)
          : Number(gaji.potongan) + Number(selisihPotongan ?? 0);

      if (tunjangan < 0 || potongan < 0) {
        throw new ApiError(400, 'Nominal tunjangan dan potongan tidak boleh negatif');
      }
      const totalGaji = Math.max(0, Number(gaji.gajiPokok) + tunjangan - potongan);

      await tx.penggajian.update({
        where: { idGaji: gaji.idGaji },
        data: { tunjangan, potongan, totalGaji },
      });
    }

    return tx.pengajuan_banding_gaji.update({
      where: { idPengajuan: b.idPengajuan },
      data: {
        status,
        keputusan: keputusan?.trim() || (status === STATUS_BANDING.DIPROSES ? null : status),
      },
      include: includeDetail,
    });
  });

  res.json({
    success: true,
    message: `Status pengajuan banding diubah menjadi ${status}`,
    data: await lampirkanSlip(updated),
  });
});

/** PATCH /api/banding-gaji/:idPengajuan/batal — pemilik membatalkan banding yang masih Menunggu. */
export const batalkanBanding = asyncHandler(async (req, res) => {
  const b = await prisma.pengajuan_banding_gaji.findFirst({
    where: { idPengajuan: req.params.idPengajuan, idPegawai: req.user.idPegawai },
  });
  if (!b) throw new ApiError(404, 'Pengajuan banding tidak ditemukan');
  if (b.status !== STATUS_BANDING.MENUNGGU) {
    throw new ApiError(400, `Pengajuan sudah berstatus ${b.status} dan tidak bisa dibatalkan`);
  }

  const updated = await prisma.pengajuan_banding_gaji.update({
    where: { idPengajuan: b.idPengajuan },
    data: { status: STATUS_BANDING.DIBATALKAN },
    include: includeDetail,
  });
  res.json({ success: true, message: 'Pengajuan banding dibatalkan', data: await lampirkanSlip(updated) });
});

