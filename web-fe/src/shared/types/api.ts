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

export interface PegawaiPeran {
  idPegawai: string;
  idPeran: string;
  isPrimary?: boolean;
  peran_tenaga_medis?: PeranTenagaMedis;
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
  pegawai_peran?: PegawaiPeran[];
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
  lembur?: boolean;
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
  status?: string;
  lembur?: boolean;
  menitTerlambat?: number;
  durasi?: string;
  durasiMenit?: number | null;
  jamMasuk?: string | null;
  jamKeluar?: string | null;
  waktuKeluar?: string | null;
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
  totalPendapatan?: number | string;
  metrikKehadiran?: {
    totalJadwalReguler?: number;
    hariHadir?: number;
    jumlahTerlambat?: number;
    jumlahShiftMalam?: number;
    jamLembur?: number;
    hariAlpa?: number;
    hariCutiIzin?: number;
  };
  rincianTunjangan?: {
    tunjanganJabatan?: number;
    tunjanganShiftMalam?: number;
    uangLembur?: number;
    tunjanganKehadiran?: number;
    insentifJasaMedis?: number;
    tunjanganTambahan?: number;
  };
  rincianPotongan?: {
    potonganTidakHadir?: number;
    potonganTerlambat?: number;
    potonganTambahan?: number;
  };
  rincianPerPeran?: Array<{
    peran?: PeranTenagaMedis;
    pedoman?: PedomanGajiItem;
    komponen?: any;
  }>;
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
  penggajian?: PenggajianItem | null;
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

export interface ActivityItem {
  title: string;
  subtitle: string;
  status: "Disetujui" | "Menunggu" | "Diproses" | "Ditolak" | "Terbayar";
}

export interface WeeklyAttendanceItem {
  day: string;
  date?: string;
  percent: number;
  present: number;
  active?: boolean;
}

export interface HrdDashboardData {
  metrics: {
    totalPegawaiAktif: number;
    rekrutmenBaruBulanIni: number;
    tingkatKehadiranHariIni: number;
    kehadiranDetail: {
      hadir: number;
      izinSakit: number;
      cuti: number;
    };
    pendingBandingCount: number;
    totalPedomanCount: number;
    pegawaiTanpaAkunCount: number;
    kepatuhanOnTime: number;
  };
  distribusiDivisi: {
    nama: string;
    count: number;
    percent: number;
  }[];
  statusKepegawaian: {
    tetap: number;
    kontrak: number;
  };
  trenKehadiranMingguan: WeeklyAttendanceItem[];
  shiftMonitoring: {
    pagi: number;
    siang: number;
    malam: number;
  };
  recentActivities: ActivityItem[];
}

export interface KeuanganDashboardData {
  metrics: {
    periodeAktif: string;
    totalDisbursed: string;
    totalDisbursedRaw: number;
    paidCount: number;
    totalStaff: number;
    totalPotongan: string;
    totalPotonganRaw: number;
    pendingBandingCount: number;
  };
  alokasiBebanPerUnit: {
    unit: string;
    total: number;
    labelNominal: string;
    percent: number;
  }[];
  monthlyPayrollTrend: {
    month: string;
    total: number;
    label: string;
    active?: boolean;
  }[];
  recentPayrollLogs: ActivityItem[];
}

export interface SekretarisDashboardData {
  unitKerja?: string;
  metrics: {
    tenagaMedisUnit: number;
    perawatCount: number;
    dokterCount: number;
    personelJagaHariIni: number;
    shiftHariIni: {
      pagi: number;
      siang: number;
      malam: number;
    };
    pendingSubmissionsCount: number;
    kehadiranUnitBulanIni: number;
  };
  kapasitasBOR: {
    borPercent: number;
    bedTerisi: number;
    totalBed: number;
    bedTersedia: number;
    pasienBaru: number;
  };
  weeklyShiftCoverage: {
    day: string;
    date?: string;
    pagi: number;
    siang: number;
    malam: number;
    coverage: number;
    active?: boolean;
  }[];
  recentSubmissions: ActivityItem[];
}

export interface TenagaMedisDashboardData {
  pegawai?: {
    idPegawai?: string;
    nama?: string;
    nip?: string;
    jabatan?: string;
    unitKerja?: string;
    sisaJatahCuti?: number;
  };
  todayShift: {
    namaShift: string;
    jamMulai: string;
    jamSelesai: string;
    ruangan: string;
  };
  metrics: {
    tingkatKehadiran: number;
    hadirCount: number;
    mangkirCount: number;
    jamKerjaBulanIni: number;
    targetJamKerja: number;
    jamLembur: number;
    skorKedisiplinan: number;
    gajiTerkini: string;
    gajiPeriode: string;
    statusGaji: string;
    sisaCuti: number;
  };
  weeklyHours: {
    day: string;
    date?: string;
    hours: number;
    target: number;
    isOff?: boolean;
    active?: boolean;
  }[];
  komposisiShiftBulanIni: {
    totalShift: number;
    pagi: { count: number; percent: number };
    siang: { count: number; percent: number };
    malam: { count: number; percent: number };
  };
  recentLeaves: ActivityItem[];
}

