import prisma from '../config/prisma.js';
import { ApiError } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';
import {
  JADWAL_SPESIALIS_DEFAULT,
  JENIS_PRAKTIK,
  SHIFT,
  formatTanggal,
  hariIni,
  isLembur,
  isSpesialis,
  isTumpangTindih,
  jenisLembur,
  parseJam,
  tambahHari,
} from '../utils/jadwal.js';

export const STATUS_DISETUJUI = 'Disetujui';

const includePeran = { peran_tenaga_medis: { select: { idPeran: true, namaPeran: true } } };


export async function scopePegawai(user) {
  if (user.role === ROLES.HRD) return {};
  if (user.role === ROLES.SEKRETARIS_UNIT) {
    const saya = await prisma.pegawai.findUnique({
      where: { idPegawai: user.idPegawai },
      select: { unitKerja: true },
    });
    if (!saya) throw new ApiError(404, 'Data pegawai Anda tidak ditemukan');
    return { unitKerja: saya.unitKerja };
  }
  throw new ApiError(403, 'Anda tidak memiliki akses mengelola jadwal');
}

/** Ambil pegawai + pastikan berada dalam lingkup akses user. */
export async function ambilPegawaiTerkelola(user, idPegawai) {
  const scope = await scopePegawai(user);
  const pegawai = await prisma.pegawai.findFirst({
    where: { idPegawai, ...scope },
    include: includePeran,
  });
  if (!pegawai) throw new ApiError(404, `Pegawai ${idPegawai} tidak ditemukan di unit Anda`);
  return pegawai;
}


export function tentukanSlot(pegawai, { shift, jamMulai, jamSelesai, lembur }) {
  if (isSpesialis(pegawai)) {
    const mulai = parseJam(jamMulai ?? JADWAL_SPESIALIS_DEFAULT.jamMulai);
    const selesai = parseJam(jamSelesai ?? JADWAL_SPESIALIS_DEFAULT.jamSelesai);
    if (!mulai || !selesai) throw new ApiError(400, 'Format jam harus HH:mm');
    if (mulai.getTime() === selesai.getTime()) throw new ApiError(400, 'Jam mulai dan selesai tidak boleh sama');
    return { jenisJadwal: JENIS_PRAKTIK, jamMulai: mulai, jamSelesai: selesai };
  }

  const def = SHIFT[shift];
  if (!def) {
    throw new ApiError(400, `Pegawai ${pegawai.nama} memakai sistem shift. Pilih shift: ${Object.keys(SHIFT).join(', ')}`);
  }
  return {
    jenisJadwal: lembur ? jenisLembur(def.jenisJadwal) : def.jenisJadwal,
    jamMulai: parseJam(def.jamMulai),
    jamSelesai: parseJam(def.jamSelesai),
  };
}


export async function validasiJadwal(pegawai, slot, { kecualiIdJadwal } = {}) {
  if (pegawai.statusPegawai !== 'Aktif') {
    throw new ApiError(400, `Pegawai ${pegawai.nama} tidak berstatus Aktif`);
  }
  if (slot.tanggal < hariIni()) {
    throw new ApiError(400, 'Tidak bisa membuat jadwal untuk tanggal yang sudah lewat');
  }

  const cuti = await prisma.pengajuan_cuti.findFirst({
    where: {
      idPegawai: pegawai.idPegawai,
      tanggalMulai: { lte: slot.tanggal },
      tanggalSelesai: { gte: slot.tanggal },
      OR: [{ status: STATUS_DISETUJUI }, { keputusan: STATUS_DISETUJUI }],
    },
  });
  if (cuti) {
    throw new ApiError(400, `${pegawai.nama} sedang cuti pada ${formatTanggal(slot.tanggal)}`);
  }

  // Shift malam bisa menyeberang ke hari berikutnya -> cek H-1 s/d H+1
  const sekitar = await prisma.jadwal.findMany({
    where: {
      idPegawai: pegawai.idPegawai,
      tanggal: { gte: tambahHari(slot.tanggal, -1), lte: tambahHari(slot.tanggal, 1) },
      ...(kecualiIdJadwal && { NOT: { idJadwal: kecualiIdJadwal } }),
    },
  });
  const bentrok = sekitar.find((j) => isTumpangTindih(j, slot));
  if (bentrok) {
    throw new ApiError(
      409,
      `${pegawai.nama} sudah punya jadwal ${bentrok.jenisJadwal} pada ${formatTanggal(bentrok.tanggal)} yang bertabrakan`,
    );
  }

  if (!isSpesialis(pegawai)) {
    const tglSama = (j) => j.tanggal.getTime() === slot.tanggal.getTime();
    const reguler = sekitar.find((j) => tglSama(j) && !isLembur(j.jenisJadwal));
    if (!isLembur(slot.jenisJadwal) && reguler) {
      throw new ApiError(
        409,
        `${pegawai.nama} sudah punya ${reguler.jenisJadwal} pada ${formatTanggal(slot.tanggal)} (maks 1 shift per hari). ` +
          'Jika tetap dijadwalkan, tandai sebagai lembur (lembur: true).',
      );
    }
    if (isLembur(slot.jenisJadwal) && !reguler) {
      throw new ApiError(
        400,
        `${pegawai.nama} belum punya shift reguler pada ${formatTanggal(slot.tanggal)}, jadwalkan sebagai shift biasa (bukan lembur)`,
      );
    }
  }
}

/** Jadwal hanya boleh diubah/dihapus jika belum lewat dan belum ada absensi. */
export async function pastikanJadwalBisaDiubah(jadwal) {
  if (jadwal.tanggal < hariIni()) {
    throw new ApiError(400, 'Jadwal yang sudah lewat tidak bisa diubah atau dihapus');
  }
  const absen = await prisma.absensi.count({ where: { idJadwal: jadwal.idJadwal } });
  if (absen > 0) {
    throw new ApiError(400, 'Jadwal sudah memiliki data absensi, tidak bisa diubah atau dihapus');
  }
}



export async function pastikanTidakAdaLemburTergantung(jadwal) {
  if (isLembur(jadwal.jenisJadwal)) return;
  const lembur = await prisma.jadwal.findFirst({
    where: {
      idPegawai: jadwal.idPegawai,
      tanggal: jadwal.tanggal,
      jenisJadwal: { startsWith: 'Lembur ' },
      NOT: { idJadwal: jadwal.idJadwal },
    },
  });
  if (lembur) {
    throw new ApiError(
      400,
      `Masih ada jadwal ${lembur.jenisJadwal} pada ${formatTanggal(jadwal.tanggal)}. Hapus/ubah jadwal lembur tersebut terlebih dahulu.`,
    );
  }
}
