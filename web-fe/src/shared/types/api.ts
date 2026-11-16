/**
 * Tipe data API RSI Medika terpusat
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: any;
}

export interface PeranTenagaMedis {
  idPeran: string;
  namaPeran: string;
  kategori: string;
  deskripsi?: string | null;
}

export interface Pegawai {
  idPegawai: string;
  nama: string;
  nip: string;
  alamat?: string | null;
  noTelp?: string | null;
  email: string;
  jabatan: string;
  unitKerja: string;
  statusPegawai: string;
  tanggalMasuk: string;
  sisaJatahCuti: number;
  idPeran?: string | null;
  peran_tenaga_medis?: PeranTenagaMedis | null;
  akun?: {
    idAkun: string;
    username: string;
    role: string;
  } | null;
}

export interface UserMe {
  idAkun: string;
  username: string;
  role: string;
  pegawai: Pegawai;
}

export interface AuthLoginData {
  token: string;
  user: {
    idAkun: string;
    username: string;
    role: string;
    pegawai: {
      idPegawai: string;
      nama: string;
      email: string;
      jabatan: string;
      unitKerja: string;
    };
  };
}

export interface ShiftItem {
  id: string;
  nama: string;
  jamMulai: string;
  jamSelesai: string;
}

export interface JadwalItem {
  idJadwal: string;
  idPegawai: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  jenisJadwal: string;
  pegawai?: {
    idPegawai: string;
    nama: string;
    nip: string;
    jabatan: string;
    unitKerja: string;
  };
  absensi?: AbsensiItem[];
}

export interface AbsensiItem {
  idAbsensi: string;
  idPegawai: string;
  idJadwal: string;
  tanggal: string;
  waktuMasuk: string | null;
  waktuPulang: string | null;
  statusKehadiran: string;
  statusPulang: string | null;
  jadwal?: JadwalItem;
  pegawai?: Pegawai;
}

export interface AbsensiStatusResponse {
  waktuServer: string;
  aturan: {
    bukaSebelumMenit: number;
    toleransiTerlambatMenit: number;
    batasPulangSetelahMenit: number;
  };
  bisaAbsenMasuk: boolean;
  bisaAbsenPulang: boolean;
  jadwalAktif: JadwalItem[];
  absensiBerjalan: AbsensiItem[];
  jadwalBerikutnya: JadwalItem | null;
}

export interface PengajuanJadwalItem {
  idPengajuan: string;
  idPegawai: string;
  idJadwal: string;
  jenisPengajuan: string;
  tanggalBaru: string | null;
  jamMulaiBaru: string | null;
  jamSelesaiBaru: string | null;
  alasan: string;
  status: string;
  alasanPenolakan?: string | null;
  sisaJatahCuti: number;
  jadwal?: JadwalItem;
  pegawai?: Pegawai;
}

export interface CutiItem {
  idPengajuan: string;
  idPegawai: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  durasi: number;
  jenisCuti: string;
  alasan: string;
  status: string;
  keputusan?: string | null;
  catatan?: string | null;
  pegawai?: Pegawai;
}

export interface IzinItem {
  idPengajuan: string;
  idPegawai: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jenis: string;
  alasan: string;
  berkasPendukung?: string | null;
  status: string;
  catatan?: string | null;
  pegawai?: Pegawai;
}

export interface KoreksiAbsensiItem {
  idKoreksi: string;
  idAbsensi: string;
  waktuMasukBaru: string | null;
  waktuPulangBaru: string | null;
  alasanKoreksi: string;
  berkasPendukung?: string | null;
  status: string;
  catatan?: string | null;
  absensi?: AbsensiItem;
}

export interface PedomanGajiItem {
  idPedoman: string;
  idPeran: string;
  gajiPokok: number | string;
  tunjanganJabatan: number | string;
  tunjanganShiftMalam: number | string;
  uangLemburPerJam: number | string;
  tunjanganKehadiranPerHari: number | string;
  persenInsentifJasaMedis: number | string;
  potonganTidakHadirPerHari: number | string;
  potonganTerlambatPerKejadian: number | string;
  berlakuMulai: string;
  berlakuSampai: string | null;
  keterangan?: string | null;
  peran_tenaga_medis?: PeranTenagaMedis;
}

export interface PenggajianItem {
  idGaji: string;
  idPegawai: string;
  periodeGaji: string;
  gajiPokok: number | string;
  tunjangan: number | string;
  potongan: number | string;
  totalGaji: number | string;
  statusPembayaran: string;
  idPedoman?: string | null;
  pedoman_penggajian?: PedomanGajiItem;
  pegawai?: Pegawai;
}

export interface BandingGajiItem {
  idPengajuan: string;
  idPegawai: string;
  periodeGaji: string;
  alasanBanding: string;
  buktiPendukung?: string | null;
  status: string;
  keputusan?: string | null;
  pegawai?: Pegawai;
}

export interface RekeningItem {
  idRekening: string;
  idPegawai: string;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
}

export interface TransaksiItem {
  idTransaksi: string;
  idPegawai: string;
  idRekening: string;
  nominal: number | string;
  jenisTransaksi: string;
  status: string;
  tanggalTransaksi: string;
  pegawai?: Pegawai;
  rekening_pegawai?: RekeningItem;
}
