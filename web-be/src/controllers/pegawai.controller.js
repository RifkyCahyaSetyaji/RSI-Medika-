import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';

/**
 * GET /api/hrd/pegawai
 * Mengambil seluruh daftar pegawai untuk HRD
 */
export const daftarPegawai = asyncHandler(async (req, res) => {
  const { search, unit, status } = req.query;

  const where = {};
  if (status && status !== 'Semua') {
    where.statusPegawai = status;
  }
  if (unit && unit !== 'Semua') {
    where.unitKerja = { contains: unit, mode: 'insensitive' };
  }
  if (search) {
    where.OR = [
      { nama: { contains: search, mode: 'insensitive' } },
      { nip: { contains: search } },
      { jabatan: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const data = await prisma.pegawai.findMany({
    where,
    include: {
      peran_tenaga_medis: true,
      akun: {
        select: {
          idAkun: true,
          username: true,
          role: true,
        },
      },
    },
    orderBy: { nama: 'asc' },
  });

  res.json({ success: true, data });
});

/**
 * GET /api/hrd/pegawai/:idPegawai
 * Mengambil detail pegawai berdasarkan idPegawai atau NIP
 */
export const detailPegawai = asyncHandler(async (req, res) => {
  const { idPegawai } = req.params;

  const pegawai = await prisma.pegawai.findFirst({
    where: {
      OR: [{ idPegawai }, { nip: idPegawai }],
    },
    include: {
      peran_tenaga_medis: true,
      akun: {
        select: {
          idAkun: true,
          username: true,
          role: true,
        },
      },
      rekening_pegawai: true,
    },
  });

  if (!pegawai) {
    throw new ApiError(404, 'Data pegawai tidak ditemukan');
  }

  res.json({ success: true, data: pegawai });
});

/**
 * POST /api/hrd/pegawai
 * Menambahkan data pegawai baru
 */
export const tambahPegawai = asyncHandler(async (req, res) => {
  const {
    nama,
    nip,
    email,
    noTelp,
    alamat,
    jabatan,
    unitKerja,
    statusPegawai = 'Aktif',
    tanggalMasuk,
    sisaJatahCuti = 12,
    idPeran,
  } = req.body || {};

  if (!nama || !nip || !email || !jabatan || !unitKerja) {
    throw new ApiError(400, 'Nama, NIP, email, jabatan, dan unit kerja wajib diisi');
  }

  const existingNip = await prisma.pegawai.findUnique({ where: { nip } });
  if (existingNip) {
    throw new ApiError(409, `Pegawai dengan NIP ${nip} sudah terdaftar`);
  }

  const existingEmail = await prisma.pegawai.findUnique({ where: { email } });
  if (existingEmail) {
    throw new ApiError(409, `Pegawai dengan email ${email} sudah terdaftar`);
  }

  if (idPeran) {
    const peran = await prisma.peran_tenaga_medis.findUnique({ where: { idPeran } });
    if (!peran) {
      throw new ApiError(400, `Peran tenaga medis dengan id ${idPeran} tidak ditemukan`);
    }
  }

  const pegawai = await prisma.pegawai.create({
    data: {
      nama: nama.trim(),
      nip: nip.trim(),
      email: email.trim().toLowerCase(),
      noTelp: noTelp ? noTelp.trim() : null,
      alamat: alamat ? alamat.trim() : null,
      jabatan: jabatan.trim(),
      unitKerja: unitKerja.trim(),
      statusPegawai: statusPegawai || 'Aktif',
      tanggalMasuk: tanggalMasuk ? new Date(tanggalMasuk) : new Date(),
      sisaJatahCuti: Number(sisaJatahCuti) || 12,
      idPeran: idPeran || null,
    },
    include: {
      peran_tenaga_medis: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Pegawai baru berhasil ditambahkan',
    data: pegawai,
  });
});

/**
 * PATCH /api/hrd/pegawai/:idPegawai
 * Memperbarui / Mengubah data pegawai (Ubah Pegawai)
 */
export const ubahPegawai = asyncHandler(async (req, res) => {
  const { idPegawai } = req.params;
  const {
    nama,
    nip,
    email,
    noTelp,
    alamat,
    jabatan,
    unitKerja,
    statusPegawai,
    tanggalMasuk,
    sisaJatahCuti,
    idPeran,
  } = req.body || {};

  const pegawai = await prisma.pegawai.findFirst({
    where: {
      OR: [{ idPegawai }, { nip: idPegawai }],
    },
  });

  if (!pegawai) {
    throw new ApiError(404, 'Data pegawai tidak ditemukan');
  }

  // Jika NIP diubah, periksa duplikasi
  if (nip && nip !== pegawai.nip) {
    const duplicateNip = await prisma.pegawai.findUnique({ where: { nip } });
    if (duplicateNip) {
      throw new ApiError(409, `NIP ${nip} sudah digunakan pegawai lain`);
    }
  }

  // Jika email diubah, periksa duplikasi
  if (email && email.toLowerCase() !== pegawai.email.toLowerCase()) {
    const duplicateEmail = await prisma.pegawai.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (duplicateEmail) {
      throw new ApiError(409, `Email ${email} sudah digunakan pegawai lain`);
    }
  }

  // Validasi idPeran bila ada
  if (idPeran) {
    const peran = await prisma.peran_tenaga_medis.findUnique({ where: { idPeran } });
    if (!peran) {
      throw new ApiError(400, `Peran tenaga medis dengan id ${idPeran} tidak ditemukan`);
    }
  }

  const updateData = {};
  if (nama !== undefined) updateData.nama = nama.trim();
  if (nip !== undefined) updateData.nip = nip.trim();
  if (email !== undefined) updateData.email = email.trim().toLowerCase();
  if (noTelp !== undefined) updateData.noTelp = noTelp ? noTelp.trim() : null;
  if (alamat !== undefined) updateData.alamat = alamat ? alamat.trim() : null;
  if (jabatan !== undefined) updateData.jabatan = jabatan.trim();
  if (unitKerja !== undefined) updateData.unitKerja = unitKerja.trim();
  if (statusPegawai !== undefined) updateData.statusPegawai = statusPegawai;
  if (tanggalMasuk !== undefined) updateData.tanggalMasuk = new Date(tanggalMasuk);
  if (sisaJatahCuti !== undefined) updateData.sisaJatahCuti = Number(sisaJatahCuti);
  if (idPeran !== undefined) updateData.idPeran = idPeran || null;

  const updated = await prisma.pegawai.update({
    where: { idPegawai: pegawai.idPegawai },
    data: updateData,
    include: {
      peran_tenaga_medis: true,
      akun: {
        select: {
          idAkun: true,
          username: true,
          role: true,
        },
      },
    },
  });

  res.json({
    success: true,
    message: `Data pegawai "${updated.nama}" berhasil diperbarui`,
    data: updated,
  });
});

/**
 * DELETE /api/hrd/pegawai/:idPegawai
 * Menghapus atau menonaktifkan pegawai
 */
export const hapusPegawai = asyncHandler(async (req, res) => {
  const { idPegawai } = req.params;

  const pegawai = await prisma.pegawai.findFirst({
    where: {
      OR: [{ idPegawai }, { nip: idPegawai }],
    },
  });

  if (!pegawai) {
    throw new ApiError(404, 'Data pegawai tidak ditemukan');
  }

  // Coba hapus atau ubah status jadi Nonaktif jika memiliki relasi
  try {
    await prisma.pegawai.delete({
      where: { idPegawai: pegawai.idPegawai },
    });
    res.json({ success: true, message: `Pegawai "${pegawai.nama}" berhasil dihapus` });
  } catch (err) {
    // Jika ada foreign key constraint (jadwal, absensi, gaji, dll), ubah status menjadi Nonaktif
    const updated = await prisma.pegawai.update({
      where: { idPegawai: pegawai.idPegawai },
      data: { statusPegawai: 'Nonaktif' },
    });
    res.json({
      success: true,
      message: `Pegawai "${updated.nama}" memiliki riwayat sistem dan berhasil dinonaktifkan (status: Nonaktif)`,
      data: updated,
    });
  }
});
