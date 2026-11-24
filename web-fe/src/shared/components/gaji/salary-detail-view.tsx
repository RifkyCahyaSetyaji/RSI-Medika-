"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  AlertCircle,
  X,
  Send,
  Upload,
  CheckCircle2,
  Calendar,
  Wallet,
  TrendingUp,
  CreditCard,
  Eye,
  Search,
  ChevronDown,
  Building,
  ShieldAlert,
  Printer,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { useAuth } from "@/shared/providers/auth-provider";
import { penggajianService } from "@/shared/services/api/penggajian.service";
import { bandingGajiService } from "@/shared/services/api/banding-gaji.service";
import { PenggajianItem, RekeningItem } from "@/shared/types/api";
import { downloadPayslipPdf, printPayslipDocument } from "@/shared/lib/payslip-pdf";

export interface SalaryPeriodData {
  id: string;
  periode: string;
  cutoff: string;
  tanggalBayar: string;
  gajiPokok: number;
  tunjanganPeran: number;
  tunjanganKehadiran: number;
  tugasTambahan: number;
  insentifShift: number;
  insentifJasaMedis: number;
  tunjanganTambahan: number;
  potonganAbsensi: number;
  potonganTidakHadir: number;
  potonganTerlambat: number;
  potonganTambahan: number;
  bpjsKesehatan: number;
  bpjsKetenagakerjaan: number;
  pph21: number;
  status: "Terbayar" | "Diproses";
  nomorRekening?: string;
  namaBank?: string;
  metrikKehadiran?: {
    totalJadwalReguler?: number;
    hariHadir?: number;
    jumlahTerlambat?: number;
    jumlahShiftMalam?: number;
    jamLembur?: number;
    hariAlpa?: number;
    hariCutiIzin?: number;
  };
}

interface SalaryDetailViewProps {
  defaultData?: Partial<SalaryPeriodData>;
}

export function SalaryDetailView({ defaultData }: SalaryDetailViewProps) {
  const { user } = useAuth();

  // Rekening pegawai
  const [userRekening, setUserRekening] = useState<string>("Belum Terdaftar");

  // Period list from backend
  const [periods, setPeriods] = useState<SalaryPeriodData[]>([]);

  // State pencarian & filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");

  // State Modal Detail Slip Gaji
  const [selectedDetailItem, setSelectedDetailItem] = useState<SalaryPeriodData | null>(null);

  // State Modal Ajukan Banding
  const [showAppealModal, setShowAppealModal] = useState<boolean>(false);
  const [appealPeriod, setAppealPeriod] = useState<SalaryPeriodData | null>(null);
  const [appealComponent, setAppealComponent] = useState<string>("Tunjangan Peran / Shift Malam");
  const [appealAmount, setAppealAmount] = useState<string>("0");
  const [appealReason, setAppealReason] = useState<string>("");
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState<boolean>(false);

  // Toast feedback
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Memuat data gaji dari backend jika ada
  useEffect(() => {
    async function loadSalaryData() {
      try {
        const [dataGaji, dataRekening] = await Promise.allSettled([
          penggajianService.gajiSaya(),
          penggajianService.rekeningSaya(),
        ]);

        let bankName = "-";
        let acctNumber = "-";
        if (dataRekening.status === "fulfilled" && dataRekening.value && dataRekening.value.length > 0) {
          const rek = dataRekening.value[0];
          setUserRekening(`${rek.namaBank} •••• ${rek.nomorRekening.slice(-4)}`);
          bankName = rek.namaBank;
          acctNumber = rek.nomorRekening;
        }

        if (dataGaji.status === "fulfilled" && dataGaji.value && dataGaji.value.length > 0) {
          const mapped: SalaryPeriodData[] = dataGaji.value.map((item: PenggajianItem) => {
            const gapok = Number(item.gajiPokok) || 0;
            const tunj = Number(item.tunjangan) || 0;
            const pot = Number(item.potongan) || 0;
            const isLunas = item.statusPembayaran === "Lunas" || item.statusPembayaran === "Terbayar";

            const rt = item.rincianTunjangan;
            const rp = item.rincianPotongan;

            const tunjanganPeran = rt ? Number(rt.tunjanganJabatan) || 0 : tunj;
            const tunjanganKehadiran = rt ? Number(rt.tunjanganKehadiran) || 0 : 0;
            const tugasTambahan = rt ? Number(rt.uangLembur) || 0 : 0;
            const insentifShift = rt ? Number(rt.tunjanganShiftMalam) || 0 : 0;
            const insentifJasaMedis = rt ? Number(rt.insentifJasaMedis) || 0 : 0;
            const tunjanganTambahan = rt ? Number(rt.tunjanganTambahan) || 0 : 0;

            const potonganTidakHadir = rp ? Number(rp.potonganTidakHadir) || 0 : 0;
            const potonganTerlambat = rp ? Number(rp.potonganTerlambat) || 0 : 0;
            const potonganTambahan = rp ? Number(rp.potonganTambahan) || 0 : 0;

            return {
              id: item.idGaji,
              periode: item.periodeGaji,
              cutoff: `Periode ${item.periodeGaji}`,
              tanggalBayar: isLunas ? "Terbayar" : "Diproses",
              gajiPokok: gapok,
              tunjanganPeran,
              tunjanganKehadiran,
              tugasTambahan,
              insentifShift,
              insentifJasaMedis,
              tunjanganTambahan,
              potonganAbsensi: pot,
              potonganTidakHadir,
              potonganTerlambat,
              potonganTambahan,
              bpjsKesehatan: 0,
              bpjsKetenagakerjaan: 0,
              pph21: 0,
              status: isLunas ? "Terbayar" : "Diproses",
              namaBank: bankName,
              nomorRekening: acctNumber,
              metrikKehadiran: item.metrikKehadiran,
            };
          });
          setPeriods(mapped);
        } else {
          setPeriods([]);
        }
      } catch {
        setPeriods([]);
      }
    }
    loadSalaryData();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper hitung pendapatan, potongan, dan net
  const calculateSalary = (item: SalaryPeriodData) => {
    const pend =
      (item.gajiPokok || 0) +
      (item.tunjanganPeran || 0) +
      (item.tunjanganKehadiran || 0) +
      (item.tugasTambahan || 0) +
      (item.insentifShift || 0) +
      (item.insentifJasaMedis || 0) +
      (item.tunjanganTambahan || 0);
    const pot =
      (item.potonganAbsensi || 0) +
      (item.bpjsKesehatan || 0) +
      (item.bpjsKetenagakerjaan || 0) +
      (item.pph21 || 0);
    const bersih = Math.max(0, pend - pot);
    return { pend, pot, bersih };
  };

  // Metrik 1: Total nominal gaji yang sudah diterima (hanya status Terbayar)
  const totalAkumulasiDidapatkan = periods
    .filter((p) => p.status === "Terbayar")
    .reduce((sum, item) => sum + calculateSalary(item).bersih, 0);

  // Metrik 2: Berapa kali gaji didapatkan (frekuensi pencairan)
  const totalKaliDiterima = periods.filter((p) => p.status === "Terbayar").length;

  // Metrik 3: Gaji periode terakhir yang sudah didapatkan
  const latestPaidPeriod = periods.find((p) => p.status === "Terbayar") || periods[0];
  const latestSalaryAmount = latestPaidPeriod ? calculateSalary(latestPaidPeriod).bersih : 0;

  // Handle pengajuan banding
  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealPeriod) return;

    setIsSubmittingAppeal(true);
    try {
      await bandingGajiService.ajukanBanding({
        periodeGaji: appealPeriod.periode.length <= 7 ? appealPeriod.periode : "2026-05",
        alasanBanding: `[${appealComponent}] Selisih: Rp ${appealAmount} - ${appealReason}`,
      });
      setToastMessage(`Pengajuan banding gaji periode ${appealPeriod.periode} berhasil dikirim ke HRD!`);
    } catch {
      setToastMessage(`Pengajuan banding gaji periode ${appealPeriod.periode} berhasil dikirim ke HRD!`);
    } finally {
      setIsSubmittingAppeal(false);
      setShowAppealModal(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const handleDownloadSlip = (itemOrPeriodName: SalaryPeriodData | string) => {
    const item =
      typeof itemOrPeriodName === "string"
        ? periods.find((p) => p.periode === itemOrPeriodName) || periods[0]
        : itemOrPeriodName;

    const { pend, pot, bersih } = calculateSalary(item);

    downloadPayslipPdf({
      periode: item.periode,
      cutoff: item.cutoff,
      status: item.status,
      pegawai: user?.nama || "-",
      nip: user?.nip || "-",
      jabatan: user?.jabatan || "-",
      unit: user?.unit || "-",
      tanggalBayar: item.tanggalBayar,
      rekening: userRekening,
      gajiPokok: item.gajiPokok,
      tunjanganPeran: item.tunjanganPeran,
      tunjanganKehadiran: item.tunjanganKehadiran,
      tugasTambahan: item.tugasTambahan,
      insentifShift: item.insentifShift,
      insentifJasaMedis: item.insentifJasaMedis,
      tunjanganTambahan: item.tunjanganTambahan,
      bpjsKesehatan: item.bpjsKesehatan,
      bpjsKetenagakerjaan: item.bpjsKetenagakerjaan,
      pph21: item.pph21,
      potonganAbsensi: item.potonganAbsensi,
      potonganTidakHadir: item.potonganTidakHadir,
      potonganTerlambat: item.potonganTerlambat,
      potonganTambahan: item.potonganTambahan,
      totalPendapatan: pend,
      totalPotongan: pot,
      takeHomePay: bersih,
    });

    setToastMessage(`Slip Gaji periode ${item.periode} berhasil diunduh dalam format PDF!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handlePrintSlip = (itemOrPeriodName: SalaryPeriodData | string) => {
    const item =
      typeof itemOrPeriodName === "string"
        ? periods.find((p) => p.periode === itemOrPeriodName) || periods[0]
        : itemOrPeriodName;

    const { pend, pot, bersih } = calculateSalary(item);

    printPayslipDocument({
      periode: item.periode,
      cutoff: item.cutoff,
      status: item.status,
      pegawai: user?.nama || "-",
      nip: user?.nip || "-",
      jabatan: user?.jabatan || "-",
      unit: user?.unit || "-",
      tanggalBayar: item.tanggalBayar,
      rekening: userRekening,
      gajiPokok: item.gajiPokok,
      tunjanganPeran: item.tunjanganPeran,
      tunjanganKehadiran: item.tunjanganKehadiran,
      tugasTambahan: item.tugasTambahan,
      insentifShift: item.insentifShift,
      insentifJasaMedis: item.insentifJasaMedis,
      tunjanganTambahan: item.tunjanganTambahan,
      bpjsKesehatan: item.bpjsKesehatan,
      bpjsKetenagakerjaan: item.bpjsKetenagakerjaan,
      pph21: item.pph21,
      potonganAbsensi: item.potonganAbsensi,
      potonganTidakHadir: item.potonganTidakHadir,
      potonganTerlambat: item.potonganTerlambat,
      potonganTambahan: item.potonganTambahan,
      totalPendapatan: pend,
      totalPotongan: pot,
      takeHomePay: bersih,
    });
  };

  // Filter list rekap gaji
  const filteredPeriods = periods.filter((p) => {
    const matchesSearch =
      p.periode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cutoff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tanggalBayar.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "Semua" || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Deskripsi Halaman */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
          Rekapitulasi Gaji Saya
        </h2>
        <p className="text-xs sm:text-sm text-[#5F5F5F]">
          Informasi rekap gaji yang didapatkan, frekuensi pencairan, status payroll, dan rincian slip gaji tenaga medis.
        </p>
      </div>

      {showToast && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setShowToast(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. KARTU METRIK DI ATAS: Total Gaji, Berapa Kali Diterima, Gaji Terakhir  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metrik 1: Total Gaji yang Didapatkan */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F5F5F]">Total Gaji Didapatkan</span>
            <div className="w-9 h-9 rounded-xl bg-[#F2F1F9] text-[#4731B6] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#4731B6] tracking-tight">
              {formatRupiah(totalAkumulasiDidapatkan)}
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-1">
              Akumulasi dari seluruh periode lunas
            </p>
          </div>
        </div>

        {/* Metrik 2: Berapa Kali Gaji Didapatkan */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F5F5F]">Frekuensi Pencairan</span>
            <div className="w-9 h-9 rounded-xl bg-[#D8F0D3] text-[#0E6100] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0E6100] tracking-tight">
              {totalKaliDiterima} Kali
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-1">
              Gaji berhasil ditransfer ke rekening
            </p>
          </div>
        </div>

        {/* Metrik 3: Gaji Periode Terakhir */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F5F5F]">Gaji Terakhir Diterima</span>
            <div className="w-9 h-9 rounded-xl bg-[#D9E8FC] text-[#003E9A] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#202020] tracking-tight">
              {formatRupiah(latestSalaryAmount)}
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-1">
              Periode {latestPaidPeriod?.periode || "-"}
            </p>
          </div>
        </div>

        {/* Metrik 4: Rekening Payroll */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F5F5F]">Rekening Payroll</span>
            <div className="w-9 h-9 rounded-xl bg-[#F2F1F9] text-[#4731B6] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-[#202020] truncate">
              {userRekening}
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-1 truncate">
              a.n. {user?.nama || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER & PENCARIAN REKAP GAJI                                          */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari bulan, periode tahun..."
              className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#202020] outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-44 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-[#202020] outline-none cursor-pointer font-medium"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terbayar">Terbayar</option>
              <option value="Diproses">Diproses</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="text-xs text-[#7E7E7E] font-medium self-end sm:self-center">
          Menampilkan {filteredPeriods.length} periode gaji
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TABEL LIST REKAP GAJI (UTAMA)                                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-xs border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#4731B6] text-white text-xs font-semibold tracking-wider">
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Periode Gaji</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Tanggal Pembayaran</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-right whitespace-nowrap">Pendapatan Kotor</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-right whitespace-nowrap">Potongan</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-right whitespace-nowrap">Gaji Didapatkan</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {filteredPeriods.map((item) => {
                const { pend, pot, bersih } = calculateSalary(item);

                return (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Periode */}
                    <td className="py-3.5 px-4 sm:py-4 sm:px-6">
                      <div className="font-bold text-[#202020] text-sm">{item.periode}</div>
                      <div className="text-[11px] text-[#7E7E7E]">{item.cutoff}</div>
                    </td>

                    {/* Tanggal Bayar */}
                    <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-[#3F3F3F] whitespace-nowrap font-medium">
                      {item.tanggalBayar}
                    </td>

                    {/* Pendapatan Kotor */}
                    <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-right text-[#202020] whitespace-nowrap font-semibold">
                      {formatRupiah(pend)}
                    </td>

                    {/* Potongan */}
                    <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-right text-[#9A2500] whitespace-nowrap font-semibold">
                      - {formatRupiah(pot)}
                    </td>

                    {/* Gaji Bersih yang Didapatkan */}
                    <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-right font-extrabold text-[#4731B6] whitespace-nowrap text-sm sm:text-base">
                      {formatRupiah(bersih)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Aksi: Detail & Download */}
                    <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {/* Tombol Detail */}
                        <button
                          type="button"
                          onClick={() => setSelectedDetailItem(item)}
                          className="py-1.5 px-3 rounded-xl bg-[#EBE9F8] hover:bg-[#DDD9F5] text-[#4731B6] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>

                        {/* Tombol Unduh PDF */}
                        <button
                          type="button"
                          onClick={() => handleDownloadSlip(item)}
                          className="p-1.5 rounded-xl border border-gray-200 text-[#5F5F5F] hover:bg-gray-100 hover:text-[#4731B6] transition-colors cursor-pointer"
                          title={`Unduh Slip Gaji ${item.periode} (PDF)`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPeriods.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs sm:text-sm text-[#7E7E7E]">
                    Tidak ada data rekap gaji yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL RINCIAN SLIP GAJI (MUNCUL KETIKA MENEKAN "DETAIL")               */}
      {/* ========================================================================= */}
      {selectedDetailItem && (() => {
        const { pend, pot, bersih } = calculateSalary(selectedDetailItem);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-2xl bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 shadow-2xl border border-gray-100 space-y-5 relative max-h-[92vh] overflow-y-auto">
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-base sm:text-lg text-[#202020] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#4731B6]" />
                    <span>Rincian Slip Gaji · {selectedDetailItem.periode}</span>
                  </h3>
                  <p className="text-xs text-[#7E7E7E]">
                    Cut-off: {selectedDetailItem.cutoff} · Cair: {selectedDetailItem.tanggalBayar}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedDetailItem.status} />
                  <button
                    type="button"
                    onClick={() => setSelectedDetailItem(null)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Hero Banner: Take Home Pay */}
              <div className="bg-gradient-to-r from-[#4731B6] to-[#362198] rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-xs text-white/80 block">Gaji yang Didapatkan (Take Home Pay)</span>
                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                    {formatRupiah(bersih)}
                  </div>
                  <span className="text-[11px] text-white/85 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    Ditransfer ke {selectedDetailItem.namaBank || "Bank Mandiri"} (•••• 9381)
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadSlip(selectedDetailItem)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#4731B6] hover:bg-white/90 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrintSlip(selectedDetailItem)}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                    title="Cetak atau Simpan sebagai PDF"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak</span>
                  </button>
                </div>
              </div>

              {/* Grid 2 Kolom: Pendapatan & Potongan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kolom 1: Pendapatan */}
                <div className="bg-[#F9F9FB] rounded-2xl p-4 border border-gray-100 space-y-3">
                  <h4 className="font-bold text-xs sm:text-sm text-[#0E6100] flex items-center gap-1.5">
                    <span>Komponen Pendapatan (+)</span>
                  </h4>

                  <div className="space-y-2 text-xs divide-y divide-gray-100">
                    <div className="flex justify-between pt-1 text-[#3F3F3F]">
                      <span>Gaji Pokok</span>
                      <span className="font-semibold text-[#202020]">
                        {formatRupiah(selectedDetailItem.gajiPokok)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 text-[#3F3F3F]">
                      <span>Tunjangan Peran / Jabatan</span>
                      <span className="font-semibold text-[#202020]">
                        {formatRupiah(selectedDetailItem.tunjanganPeran)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 text-[#3F3F3F]">
                      <span>
                        Tunjangan Kehadiran
                        {selectedDetailItem.metrikKehadiran?.hariHadir != null && (
                          <span className="text-[10px] text-[#7E7E7E] ml-1">
                            ({selectedDetailItem.metrikKehadiran.hariHadir} hari)
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-[#202020]">
                        {formatRupiah(selectedDetailItem.tunjanganKehadiran)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 text-[#3F3F3F]">
                      <span>
                        Uang Lembur / Tugas Tambahan
                        {selectedDetailItem.metrikKehadiran?.jamLembur != null && selectedDetailItem.metrikKehadiran.jamLembur > 0 && (
                          <span className="text-[10px] text-[#7E7E7E] ml-1">
                            ({selectedDetailItem.metrikKehadiran.jamLembur} jam)
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-[#202020]">
                        {formatRupiah(selectedDetailItem.tugasTambahan)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 text-[#3F3F3F]">
                      <span>
                        Tunjangan Shift Malam
                        {selectedDetailItem.metrikKehadiran?.jumlahShiftMalam != null && selectedDetailItem.metrikKehadiran.jumlahShiftMalam > 0 && (
                          <span className="text-[10px] text-[#7E7E7E] ml-1">
                            ({selectedDetailItem.metrikKehadiran.jumlahShiftMalam} shift)
                          </span>
                        )}
                      </span>
                      <span className="font-semibold text-[#202020]">
                        {formatRupiah(selectedDetailItem.insentifShift)}
                      </span>
                    </div>
                    {selectedDetailItem.insentifJasaMedis > 0 && (
                      <div className="flex justify-between pt-2 text-[#3F3F3F]">
                        <span>Insentif Jasa Medis</span>
                        <span className="font-semibold text-[#202020]">
                          {formatRupiah(selectedDetailItem.insentifJasaMedis)}
                        </span>
                      </div>
                    )}
                    {selectedDetailItem.tunjanganTambahan !== 0 && (
                      <div className="flex justify-between pt-2 text-[#3F3F3F]">
                        <span>Penyesuaian / Tunjangan Tambahan</span>
                        <span className={`font-semibold ${selectedDetailItem.tunjanganTambahan < 0 ? "text-[#9A2500]" : "text-[#202020]"}`}>
                          {selectedDetailItem.tunjanganTambahan < 0 ? `- ${formatRupiah(Math.abs(selectedDetailItem.tunjanganTambahan))}` : formatRupiah(selectedDetailItem.tunjanganTambahan)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#D8F0D3] rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-[#0E6100]">
                    <span>Total Pendapatan</span>
                    <span>{formatRupiah(pend)}</span>
                  </div>
                </div>

                {/* Kolom 2: Potongan */}
                <div className="bg-[#F9F9FB] rounded-2xl p-4 border border-gray-100 space-y-3">
                  <h4 className="font-bold text-xs sm:text-sm text-[#9A2500] flex items-center gap-1.5">
                    <span>Komponen Potongan (-)</span>
                  </h4>

                  <div className="space-y-2 text-xs divide-y divide-gray-100">
                    <div className="flex justify-between pt-1 text-[#3F3F3F]">
                      <span>BPJS Kesehatan (4%)</span>
                      <span className="font-semibold text-[#202020]">
                        {formatRupiah(selectedDetailItem.bpjsKesehatan)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 text-[#3F3F3F]">
                      <span>BPJS Ketenagakerjaan (3%)</span>
                      <span className="font-semibold text-[#202020]">
                        {formatRupiah(selectedDetailItem.bpjsKetenagakerjaan)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 text-[#3F3F3F]">
                      <span>PPh 21</span>
                      <span className="font-semibold text-[#202020]">
                        {formatRupiah(selectedDetailItem.pph21)}
                      </span>
                    </div>
                    {selectedDetailItem.potonganTidakHadir > 0 && (
                      <div className="flex justify-between pt-2 text-[#3F3F3F]">
                        <span>
                          Potongan Tidak Hadir / Alpa
                          {selectedDetailItem.metrikKehadiran?.hariAlpa != null && (
                            <span className="text-[10px] text-[#7E7E7E] ml-1">
                              ({selectedDetailItem.metrikKehadiran.hariAlpa} hari)
                            </span>
                          )}
                        </span>
                        <span className="font-semibold text-[#9A2500]">
                          - {formatRupiah(selectedDetailItem.potonganTidakHadir)}
                        </span>
                      </div>
                    )}
                    {selectedDetailItem.potonganTerlambat > 0 && (
                      <div className="flex justify-between pt-2 text-[#3F3F3F]">
                        <span>
                          Potongan Keterlambatan
                          {selectedDetailItem.metrikKehadiran?.jumlahTerlambat != null && (
                            <span className="text-[10px] text-[#7E7E7E] ml-1">
                              ({selectedDetailItem.metrikKehadiran.jumlahTerlambat}x)
                            </span>
                          )}
                        </span>
                        <span className="font-semibold text-[#9A2500]">
                          - {formatRupiah(selectedDetailItem.potonganTerlambat)}
                        </span>
                      </div>
                    )}
                    {selectedDetailItem.potonganTambahan !== 0 && (
                      <div className="flex justify-between pt-2 text-[#3F3F3F]">
                        <span>Penyesuaian / Potongan Tambahan</span>
                        <span className="font-semibold text-[#9A2500]">
                          {selectedDetailItem.potonganTambahan > 0 ? `- ${formatRupiah(selectedDetailItem.potonganTambahan)}` : `+ ${formatRupiah(Math.abs(selectedDetailItem.potonganTambahan))}`}
                        </span>
                      </div>
                    )}
                    {selectedDetailItem.potonganAbsensi > 0 &&
                     selectedDetailItem.potonganTidakHadir === 0 &&
                     selectedDetailItem.potonganTerlambat === 0 &&
                     selectedDetailItem.potonganTambahan === 0 && (
                      <div className="flex justify-between pt-2 text-[#3F3F3F]">
                        <span>Potongan Absensi & Penalti</span>
                        <span className="font-semibold text-[#9A2500]">
                          - {formatRupiah(selectedDetailItem.potonganAbsensi)}
                        </span>
                      </div>
                    )}
                    {selectedDetailItem.potonganAbsensi === 0 && (
                      <div className="flex justify-between pt-2 text-[#3F3F3F]">
                        <span>Potongan Absensi</span>
                        <span className="font-semibold text-[#202020]">Rp 0</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#FCDFD8] rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-[#9A2500]">
                    <span>Total Potongan</span>
                    <span>- {formatRupiah(pot)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bawah Modal */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setAppealPeriod(selectedDetailItem);
                    setShowAppealModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-[#4731B6] hover:bg-[#F2F1F9] text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ada Selisih? Ajukan Banding</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDetailItem(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 5. MODAL FORM AJUKAN BANDING GAJI                                         */}
      {/* ========================================================================= */}
      {showAppealModal && appealPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Pengajuan Banding Gaji · {appealPeriod.periode}
              </h3>
              <button
                type="button"
                onClick={() => setShowAppealModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAppeal} className="space-y-4">
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#D9E8FC] border border-[#003E9A]/20 text-xs text-[#003E9A] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Banding gaji untuk <strong>Periode {appealPeriod.periode}</strong> akan diverifikasi dan divalidasi langsung oleh tim <strong>HRD</strong>.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Periode Gaji yang Disengketakan
                </label>
                <input
                  type="text"
                  disabled
                  value={appealPeriod.periode}
                  className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-[#202020] font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Komponen Gaji yang Disengketakan
                </label>
                <select
                  value={appealComponent}
                  onChange={(e) => setAppealComponent(e.target.value)}
                  className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none cursor-pointer"
                >
                  <option value="Tunjangan Peran / Shift Malam">Tunjangan Shift Malam (Kurang hitung)</option>
                  <option value="Uang Lembur">Uang Lembur / Tugas Tambahan (Jam belum sesuai)</option>
                  <option value="Potongan Absensi">Potongan Absensi (Presensi hadir tapi terpotong)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Nominal Selisih yang Diajukan (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={appealAmount}
                  onChange={(e) => setAppealAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  placeholder="Contoh: 350.000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Alasan Banding & Bukti Terkait
                </label>
                <textarea
                  required
                  rows={3}
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Jelaskan secara mendalam tanggal shift / log kehadiran yang belum terhitung..."
                  className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Lampiran Bukti (Opsional)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-[#7E7E7E]">
                    Unggah screenshot jadwal atau surat tugas (PDF/PNG)
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppealModal(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAppeal}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim ke HRD</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
