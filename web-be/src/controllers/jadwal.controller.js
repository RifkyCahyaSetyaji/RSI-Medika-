import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import {
  JADWAL_SPESIALIS_DEFAULT,
  SHIFT,
  formatTanggal,
  isLembur,
  isSpesialis,
  parseTanggal,
  serializeJadwal,
  shiftDariJam,
  tambahHari,
} from '../utils/jadwal.js';
import {
  ambilPegawaiTerkelola,
  pastikanJadwalBisaDiubah,
  pastikanTidakAdaLemburTergantung,
  scopePegawai,
  tentukanSlot,
  validasiJadwal,
} from '../services/jadwal.service.js';

const MAKS_RENTANG_HARI = 62;

const selectJadwal = {
  idJadwal: true,
  idPegawai: true,
  tanggal: true,
  jamMulai: true,
  jamSelesai: true,
  jenisJadwal: true,
  pegawai: {
    select: {
      nama: true,
      unitKerja: true,
      peran_tenaga_medis: { select: { namaPeran: true } },
    },
  },
};

function parseRentang(dari, sampai, { wajib = false } = {}) {
  if (!dari && !sampai && !wajib) return undefined;
  const d = parseTanggal(dari);
  const s = parseTanggal(sampai);
  if (!d || !s) throw new ApiError(400, 'Parameter tanggal harus berformat YYYY-MM-DD');
  if (s < d) throw new ApiError(400, 'Tanggal akhir tidak boleh sebelum tanggal awal');
  return { gte: d, lte: s };
}

/** GET /api/jadwal/shift — daftar shift & jadwal default spesialis. */
export const daftarShift = (req, res) => {
  res.json({ success: true, data: { shift: SHIFT, spesialisDefault: JADWAL_SPESIALIS_DEFAULT } });
};

/** GET /api/jadwal/saya?dari=&sampai= — jadwal milik user yang login. */
export const jadwalSaya = asyncHandler(async (req, res) => {
  const tanggal = parseRentang(req.query.dari, req.query.sampai);
  const data = await prisma.jadwal.findMany({
    where: { idPegawai: req.user.idPegawai, ...(tanggal && { tanggal }) },
    select: selectJadwal,
    orderBy: [{ tanggal: 'asc' }, { jamMulai: 'asc' }],
  });
  res.json({ success: true, data: data.map(serializeJadwal) });
});

/** GET /api/jadwal?dari=&sampai=&idPegawai=&jenisJadwal= — HRD semua, Sekretaris Unit unitnya. */
export const daftarJadwal = asyncHandler(async (req, res) => {
  const { dari, sampai, idPegawai, jenisJadwal } = req.query;
  const scope = await scopePegawai(req.user);
  const tanggal = parseRentang(dari, sampai);

  const data = await prisma.jadwal.findMany({
    where: {
      pegawai: scope,
      ...(tanggal && { tanggal }),
      ...(idPegawai && { idPegawai }),
      ...(jenisJadwal && { jenisJadwal }),
    },
    select: selectJadwal,
    orderBy: [{ tanggal: 'asc' }, { jamMulai: 'asc' }],
  });
  res.json({ success: true, data: data.map(serializeJadwal) });
});

/**
 * POST /api/jadwal — buat satu jadwal.
 * body: { idPegawai, tanggal, shift? (Pagi/Siang/Malam), lembur?, jamMulai?, jamSelesai? }
 * Non spesialis maks 1 shift reguler per hari; shift kedua di hari yang sama kirim `lembur: true`.
 */
export const buatJadwal = asyncHandler(async (req, res) => {
  const { idPegawai, tanggal } = req.body || {};
  if (!idPegawai || !tanggal) throw new ApiError(400, 'idPegawai dan tanggal wajib diisi');
  const tgl = parseTanggal(tanggal);
  if (!tgl) throw new ApiError(400, 'Tanggal harus berformat YYYY-MM-DD');

  const pegawai = await ambilPegawaiTerkelola(req.user, idPegawai);
  const slot = { tanggal: tgl, ...tentukanSlot(pegawai, req.body) };
  await validasiJadwal(pegawai, slot);

  const data = await prisma.jadwal.create({ data: { idPegawai, ...slot }, select: selectJadwal });
  res.status(201).json({ success: true, data: serializeJadwal(data) });
});

/**
 * POST /api/jadwal/bulk — buat jadwal banyak pegawai untuk rentang tanggal.
 * body: { idPegawai: [..], tanggalMulai, tanggalSelesai, shift?, lembur?, hari?: [0-6], jamMulai?, jamSelesai? }
 * - Non spesialis: wajib `shift`, default setiap hari.
 * - Spesialis: jadwal Praktik default (Senin-Jumat 08:00-14:00) kecuali diisi.
 * Tanggal yang melanggar validasi dilewati dan dilaporkan di `dilewati`.
 */
export const buatJadwalBulk = asyncHandler(async (req, res) => {
  const { idPegawai, tanggalMulai, tanggalSelesai, hari } = req.body || {};
  if (!Array.isArray(idPegawai) || idPegawai.length === 0) {
    throw new ApiError(400, 'idPegawai harus berupa array dan tidak boleh kosong');
  }
  const rentang = parseRentang(tanggalMulai, tanggalSelesai, { wajib: true });
  const jumlahHari = (rentang.lte - rentang.gte) / 86400000 + 1;
  if (jumlahHari > MAKS_RENTANG_HARI) {
    throw new ApiError(400, `Rentang tanggal maksimal ${MAKS_RENTANG_HARI} hari`);
  }
  if (hari !== undefined && (!Array.isArray(hari) || hari.some((h) => !Number.isInteger(h) || h < 0 || h > 6))) {
    throw new ApiError(400, 'hari harus array angka 0 (Minggu) s/d 6 (Sabtu)');
  }

  const dibuat = [];
  const dilewati = [];

  for (const id of [...new Set(idPegawai)]) {
    let pegawai;
    let slotDasar;
    try {
      pegawai = await ambilPegawaiTerkelola(req.user, id);
      slotDasar = tentukanSlot(pegawai, req.body);
    } catch (err) {
      dilewati.push({ idPegawai: id, alasan: err.message });
      continue;
    }

    const hariBerlaku = hari ?? (isSpesialis(pegawai) ? JADWAL_SPESIALIS_DEFAULT.hari : [0, 1, 2, 3, 4, 5, 6]);

    for (let i = 0; i < jumlahHari; i++) {
      const tgl = tambahHari(rentang.gte, i);
      if (!hariBerlaku.includes(tgl.getUTCDay())) continue;

      const slot = { tanggal: tgl, ...slotDasar };
      try {
        await validasiJadwal(pegawai, slot);
        const j = await prisma.jadwal.create({ data: { idPegawai: id, ...slot }, select: selectJadwal });
        dibuat.push(serializeJadwal(j));
      } catch (err) {
        if (!(err instanceof ApiError)) throw err;
        dilewati.push({ idPegawai: id, tanggal: formatTanggal(tgl), alasan: err.message });
      }
    }
  }

  res.status(201).json({
    success: true,
    data: { jumlahDibuat: dibuat.length, jumlahDilewati: dilewati.length, dibuat, dilewati },
  });
});

async function ambilJadwalTerkelola(user, idJadwal) {
  const scope = await scopePegawai(user);
  const jadwal = await prisma.jadwal.findFirst({ where: { idJadwal, pegawai: scope } });
  if (!jadwal) throw new ApiError(404, 'Jadwal tidak ditemukan');
  return jadwal;
}

/** PATCH /api/jadwal/:idJadwal — body: { tanggal?, shift?, jamMulai?, jamSelesai? } */
export const ubahJadwal = asyncHandler(async (req, res) => {
  const jadwal = await ambilJadwalTerkelola(req.user, req.params.idJadwal);
  await pastikanJadwalBisaDiubah(jadwal);

  const { tanggal } = req.body || {};
  const tgl = tanggal ? parseTanggal(tanggal) : jadwal.tanggal;
  if (!tgl) throw new ApiError(400, 'Tanggal harus berformat YYYY-MM-DD');

  const pegawai = await ambilPegawaiTerkelola(req.user, jadwal.idPegawai);
  const body = req.body || {};
  const gantiSlot = body.shift || body.jamMulai || body.jamSelesai || body.lembur !== undefined;
  const lembur = body.lembur ?? isLembur(jadwal.jenisJadwal);
  const slot = {
    tanggal: tgl,
    ...(gantiSlot
      ? tentukanSlot(pegawai, {
          ...body,
          lembur,
          shift: body.shift ?? shiftDariJam(jadwal.jamMulai, jadwal.jamSelesai)?.nama,
        })
      : { jenisJadwal: jadwal.jenisJadwal, jamMulai: jadwal.jamMulai, jamSelesai: jadwal.jamSelesai }),
  };
  // shift reguler yang dipindah tanggal / dijadikan lembur tidak boleh meninggalkan lembur yatim
  if (tgl.getTime() !== jadwal.tanggal.getTime() || isLembur(slot.jenisJadwal) !== isLembur(jadwal.jenisJadwal)) {
    await pastikanTidakAdaLemburTergantung(jadwal);
  }
  await validasiJadwal(pegawai, slot, { kecualiIdJadwal: jadwal.idJadwal });

  const data = await prisma.jadwal.update({
    where: { idJadwal: jadwal.idJadwal },
    data: slot,
    select: selectJadwal,
  });
  res.json({ success: true, data: serializeJadwal(data) });
});

/** DELETE /api/jadwal/:idJadwal */
export const hapusJadwal = asyncHandler(async (req, res) => {
  const jadwal = await ambilJadwalTerkelola(req.user, req.params.idJadwal);
  await pastikanJadwalBisaDiubah(jadwal);
  await pastikanTidakAdaLemburTergantung(jadwal);

  const pengajuan = await prisma.pengajuan_jadwal.count({ where: { idJadwal: jadwal.idJadwal } });
  if (pengajuan > 0) {
    throw new ApiError(400, 'Jadwal memiliki riwayat pengajuan perubahan, tidak bisa dihapus. Ubah jadwalnya saja.');
  }

  await prisma.jadwal.delete({ where: { idJadwal: jadwal.idJadwal } });
  res.json({ success: true, message: 'Jadwal dihapus' });
});

