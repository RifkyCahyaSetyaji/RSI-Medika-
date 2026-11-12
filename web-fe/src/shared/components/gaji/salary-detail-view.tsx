"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { useAuth } from "@/shared/providers/auth-provider";

export interface SalaryPeriodData {
  id: string;
  periode: string;
  cutoff: string;
  tanggalBayar: string;
  gajiPokok: number;
  tunjanganPeran: number;
  tugasTambahan: number;
  insentifShift: number;
  potonganAbsensi: number;
  bpjsKesehatan: number;
  bpjsKetenagakerjaan: number;
  pph21: number;
  status: "Terbayar" | "Diproses";
}

interface SalaryDetailViewProps {
  defaultData?: Partial<SalaryPeriodData>;
}

export function SalaryDetailView({ defaultData }: SalaryDetailViewProps) {
  const { user } = useAuth();

  // Salary periods list (Mei 2025 to Jan 2025)
  const [periodList] = useState<SalaryPeriodData[]>([
    {
      id: "PER-05",
      periode: "Mei 2025",
      cutoff: "26 Apr 2025 - 25 Mei 2025",
      tanggalBayar: "30 Mei 2025",
      gajiPokok: defaultData?.gajiPokok ?? 5250000,
      tunjanganPeran: defaultData?.tunjanganPeran ?? 1250000,
      tugasTambahan: defaultData?.tugasTambahan ?? 500000,
      insentifShift: defaultData?.insentifShift ?? 1250000,
      potonganAbsensi: defaultData?.potonganAbsensi ?? 120000,
      bpjsKesehatan: defaultData?.bpjsKesehatan ?? 300000,
      bpjsKetenagakerjaan: defaultData?.bpjsKetenagakerjaan ?? 200000,
      pph21: defaultData?.pph21 ?? 750000,
      status: "Terbayar",
    },
    {
      id: "PER-04",
      periode: "April 2025",
      cutoff: "26 Mar 2025 - 25 Apr 2025",
      tanggalBayar: "30 Apr 2025",
      gajiPokok: defaultData?.gajiPokok ?? 5250000,
      tunjanganPeran: defaultData?.tunjanganPeran ?? 1250000,
      tugasTambahan: defaultData?.tugasTambahan ?? 500000,
      insentifShift: defaultData?.insentifShift ?? 1100000,
      potonganAbsensi: 0,
      bpjsKesehatan: defaultData?.bpjsKesehatan ?? 300000,
      bpjsKetenagakerjaan: defaultData?.bpjsKetenagakerjaan ?? 200000,
      pph21: defaultData?.pph21 ?? 750000,
      status: "Terbayar",
    },
    {
      id: "PER-03",
      periode: "Maret 2025",
      cutoff: "26 Feb 2025 - 25 Mar 2025",
      tanggalBayar: "31 Mar 2025",
      gajiPokok: defaultData?.gajiPokok ?? 5250000,
      tunjanganPeran: defaultData?.tunjanganPeran ?? 1250000,
      tugasTambahan: defaultData?.tugasTambahan ?? 400000,
      insentifShift: defaultData?.insentifShift ?? 950000,
      potonganAbsensi: 60000,
      bpjsKesehatan: defaultData?.bpjsKesehatan ?? 300000,
      bpjsKetenagakerjaan: defaultData?.bpjsKetenagakerjaan ?? 200000,
      pph21: defaultData?.pph21 ?? 750000,
      status: "Terbayar",
    },
    {
      id: "PER-02",
      periode: "Februari 2025",
      cutoff: "26 Jan 2025 - 25 Feb 2025",
      tanggalBayar: "28 Feb 2025",
      gajiPokok: defaultData?.gajiPokok ?? 5250000,
      tunjanganPeran: defaultData?.tunjanganPeran ?? 1250000,
      tugasTambahan: defaultData?.tugasTambahan ?? 500000,
      insentifShift: defaultData?.insentifShift ?? 1200000,
      potonganAbsensi: 0,
      bpjsKesehatan: defaultData?.bpjsKesehatan ?? 300000,
      bpjsKetenagakerjaan: defaultData?.bpjsKetenagakerjaan ?? 200000,
      pph21: defaultData?.pph21 ?? 750000,
      status: "Terbayar",
    },
    {
      id: "PER-01",
      periode: "Januari 2025",
      cutoff: "26 Des 2024 - 25 Jan 2025",
      tanggalBayar: "31 Jan 2025",
      gajiPokok: defaultData?.gajiPokok ?? 5250000,
      tunjanganPeran: defaultData?.tunjanganPeran ?? 1250000,
      tugasTambahan: defaultData?.tugasTambahan ?? 500000,
      insentifShift: defaultData?.insentifShift ?? 1050000,
      potonganAbsensi: 0,
      bpjsKesehatan: defaultData?.bpjsKesehatan ?? 300000,
      bpjsKetenagakerjaan: defaultData?.bpjsKetenagakerjaan ?? 200000,
      pph21: defaultData?.pph21 ?? 750000,
      status: "Terbayar",
    },
  ]);

  const [selectedPeriodName, setSelectedPeriodName] = useState<string>("Mei 2025");
  const [showAppealModal, setShowAppealModal] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [appealComponent, setAppealComponent] = useState("Tunjangan Peran / Shift Malam");
  const [appealAmount, setAppealAmount] = useState("350.000");
  const [appealReason, setAppealReason] = useState("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Active selected period data
  const activePeriod =
    periodList.find((p) => p.periode === selectedPeriodName) || periodList[0];

  // Calculations for active period
  const totalPendapatanKotor =
    activePeriod.gajiPokok +
    activePeriod.tunjanganPeran +
    activePeriod.tugasTambahan +
    activePeriod.insentifShift;

  const totalPotongan =
    activePeriod.potonganAbsensi +
    activePeriod.bpjsKesehatan +
    activePeriod.bpjsKetenagakerjaan +
    activePeriod.pph21;

  // Gaji yang Sudah Didapatkan (Net Take Home Pay received)
  const gajiYangSudahDidapatkan = totalPendapatanKotor - totalPotongan;

  // Total Akumulasi Gaji yang Sudah Didapatkan (All periods YTD 2025)
  const totalAkumulasiDidapatkan = periodList.reduce((sum, item) => {
    const pend =
      item.gajiPokok + item.tunjanganPeran + item.tugasTambahan + item.insentifShift;
    const pot =
      item.potonganAbsensi + item.bpjsKesehatan + item.bpjsKetenagakerjaan + item.pph21;
    return sum + (pend - pot);
  }, 0);

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAppealModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleDownloadSlip = (periodName: string) => {
    alert(`Slip Gaji periode ${periodName} berhasil diunduh (PDF)!`);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Periode Gaji Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
            Gaji
          </h2>
          <p className="text-xs sm:text-sm text-[#5F5F5F]">
            Lihat informasi gaji, periode pembayaran, slip gaji, dan riwayat gaji yang sudah didapatkan.
          </p>
        </div>

        {/* Periode Gaji Dropdown Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-black/5 shadow-xs shrink-0">
          <Calendar className="w-4 h-4 text-[#4731B6]" />
          <span className="text-xs font-semibold text-[#5F5F5F]">Periode Gaji:</span>
          <select
            value={selectedPeriodName}
            onChange={(e) => setSelectedPeriodName(e.target.value)}
            className="bg-[#F2F1F9] hover:bg-[#EBE9F8] text-[#4731B6] text-xs font-bold py-1 px-2.5 rounded-lg border border-[#C4BAF5] cursor-pointer outline-none transition-colors"
          >
            {periodList.map((p) => (
              <option key={p.id} value={p.periode}>
                {p.periode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showToast && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              Pengajuan banding gaji periode {selectedPeriodName} berhasil dikirimkan ke HRD & Manajemen Keuangan!
            </span>
          </div>
          <button onClick={() => setShowToast(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top 3 Cards Grid: Gaji Yang Sudah Didapatkan, Ringkasan Periode, Akumulasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left: Gaji yang Sudah Didapatkan (Hero Card) */}
        <div className="lg:col-span-5 bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 md:p-8 shadow-xs border border-black/5 flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-[#202020]">
                Gaji yang Sudah Didapatkan
              </span>
              <span className="text-[11px] font-semibold text-[#4731B6] bg-[#F2F1F9] px-2.5 py-0.5 rounded-full border border-[#C4BAF5]/40">
                Periode {activePeriod.periode}
              </span>
            </div>

            <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4731B6] tracking-tight pt-1">
              {formatRupiah(gajiYangSudahDidapatkan)}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#0E6100] font-medium pt-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Lunas ditransfer pada {activePeriod.tanggalBayar}
              </span>
            </div>
            <p className="text-[11px] text-[#7E7E7E]">
              Rekening tujuan: Bank Mandiri •••• 9381 a.n. {user?.nama || "Pegawai"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAppealModal(true)}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Ajukan Banding Periode Ini</span>
          </button>
        </div>

        {/* Right: Ringkasan Periode Gaji & Akumulasi Card */}
        <div className="lg:col-span-7 bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 md:p-8 shadow-xs border border-black/5 flex flex-col justify-between space-y-5">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-[#4731B6] shrink-0" />
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-[#202020] truncate">
                  Ringkasan Gaji{" "}
                  <span className="font-normal text-[#5F5F5F]">{activePeriod.periode}</span>
                </h3>
              </div>
              <StatusBadge status={activePeriod.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] sm:text-xs text-[#7E7E7E]">
              <span>Periode cut-off: <strong>{activePeriod.cutoff}</strong></span>
              <span>•</span>
              <span>Tanggal pembayaran: <strong>{activePeriod.tanggalBayar}</strong></span>
            </div>

            {/* 3 Metric Columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 border-t border-gray-100">
              <div className="min-w-0">
                <span className="block font-bold text-xs sm:text-sm md:text-base text-[#202020] truncate">
                  {formatRupiah(totalPendapatanKotor)}
                </span>
                <span className="text-[10px] sm:text-xs text-[#7E7E7E] leading-tight block">
                  Total pendapatan kotor
                </span>
              </div>
              <div className="min-w-0">
                <span className="block font-bold text-xs sm:text-sm md:text-base text-[#9A2500] truncate">
                  - {formatRupiah(totalPotongan)}
                </span>
                <span className="text-[10px] sm:text-xs text-[#7E7E7E] leading-tight block">
                  Total potongan
                </span>
              </div>
              <div className="min-w-0">
                <span className="block font-bold text-xs sm:text-sm md:text-base text-[#4731B6] truncate">
                  {formatRupiah(gajiYangSudahDidapatkan)}
                </span>
                <span className="text-[10px] sm:text-xs text-[#7E7E7E] leading-tight block">
                  Gaji yang didapatkan
                </span>
              </div>
            </div>

            {/* Akumulasi YTD Bar */}
            <div className="bg-[#F2F1F9] p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4731B6]" />
                <span className="text-[#5F5F5F]">Total Akumulasi Gaji 2025 ({periodList.length} Periode):</span>
              </div>
              <span className="font-extrabold text-[#4731B6]">{formatRupiah(totalAkumulasiDidapatkan)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleDownloadSlip(activePeriod.periode)}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Lihat / Unduh Slip Gaji {activePeriod.periode} (PDF)</span>
          </button>
        </div>
      </div>

      {/* Rincian Komponen Gaji */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#202020]">
            Rincian Komponen Gaji · Periode {activePeriod.periode}
          </h3>
          <span className="text-xs text-[#7E7E7E] hidden sm:inline">
            Cut-off: {activePeriod.cutoff}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Pendapatan */}
          <div className="bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 shadow-xs border border-black/5 flex flex-col justify-between space-y-5">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-bold text-xs sm:text-sm text-[#0E6100]">Pendapatan</h4>

              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm divide-y divide-gray-100">
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Gaji pokok</span>
                  <span className="font-semibold text-[#202020]">
                    {formatRupiah(activePeriod.gajiPokok)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Tunjangan peran</span>
                  <span className="font-semibold text-[#202020]">
                    {formatRupiah(activePeriod.tunjanganPeran)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Tugas tambahan</span>
                  <span className="font-semibold text-[#202020]">
                    {formatRupiah(activePeriod.tugasTambahan)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Insentif Shift & Pelayanan</span>
                  <span className="font-semibold text-[#202020]">
                    {formatRupiah(activePeriod.insentifShift)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Pendapatan Bar (Green) */}
            <div className="bg-[#D8F0D3] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-[#0E6100]">
              <span>Total Pendapatan Kotor</span>
              <span>{formatRupiah(totalPendapatanKotor)}</span>
            </div>
          </div>

          {/* Card 2: Potongan */}
          <div className="bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 shadow-xs border border-black/5 flex flex-col justify-between space-y-5">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-bold text-xs sm:text-sm text-[#9A2500]">Potongan</h4>

              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm divide-y divide-gray-100">
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>BPJS Kesehatan (4%)</span>
                  <span className="font-semibold text-[#202020]">
                    {formatRupiah(activePeriod.bpjsKesehatan)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>BPJS Ketenagakerjaan (3%)</span>
                  <span className="font-semibold text-[#202020]">
                    {formatRupiah(activePeriod.bpjsKetenagakerjaan)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Pajak Penghasilan (PPh 21)</span>
                  <span className="font-semibold text-[#202020]">
                    {formatRupiah(activePeriod.pph21)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Potongan Keterlambatan / Absensi</span>
                  <span className="font-semibold text-[#9A2500]">
                    {activePeriod.potonganAbsensi > 0
                      ? `- ${formatRupiah(activePeriod.potonganAbsensi)}`
                      : "Rp 0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Potongan Bar (Red/Pink) */}
            <div className="bg-[#FCDFD8] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-[#9A2500]">
              <span>Total Potongan</span>
              <span>{formatRupiah(totalPotongan)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Periode Gaji & Gaji yang Sudah Didapatkan Table */}
      <div className="bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 shadow-xs border border-black/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#4731B6]" />
            <h3 className="font-bold text-sm sm:text-base text-[#202020]">
              Riwayat Periode Gaji & Gaji yang Sudah Didapatkan
            </h3>
          </div>
          <span className="text-xs text-[#7E7E7E]">
            Menampilkan {periodList.length} periode pembayaran tahun 2025
          </span>
        </div>

        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] sm:text-xs font-semibold text-[#7E7E7E]">
                <th className="pb-3 px-3 sm:px-4">Periode Gaji</th>
                <th className="pb-3 px-3 sm:px-4">Tanggal Pembayaran</th>
                <th className="pb-3 px-3 sm:px-4 text-right">Pendapatan</th>
                <th className="pb-3 px-3 sm:px-4 text-right">Potongan</th>
                <th className="pb-3 px-3 sm:px-4 text-right font-bold text-[#4731B6]">
                  Gaji yang Didapatkan
                </th>
                <th className="pb-3 px-3 sm:px-4 text-center">Status</th>
                <th className="pb-3 px-3 sm:px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {periodList.map((item) => {
                const pend =
                  item.gajiPokok + item.tunjanganPeran + item.tugasTambahan + item.insentifShift;
                const pot =
                  item.potonganAbsensi + item.bpjsKesehatan + item.bpjsKetenagakerjaan + item.pph21;
                const didapatkan = pend - pot;
                const isSelected = item.periode === selectedPeriodName;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? "bg-[#F2F1F9]/70 font-medium" : "hover:bg-gray-50/60"
                    }`}
                    onClick={() => setSelectedPeriodName(item.periode)}
                  >
                    <td className="py-3.5 px-3 sm:px-4">
                      <div>
                        <span className="font-bold text-[#202020] block">{item.periode}</span>
                        <span className="text-[11px] text-[#7E7E7E]">{item.cutoff}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-[#3F3F3F]">
                      {item.tanggalBayar}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right text-[#202020]">
                      {formatRupiah(pend)}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right text-[#9A2500]">
                      - {formatRupiah(pot)}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right font-extrabold text-[#4731B6]">
                      {formatRupiah(didapatkan)}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedPeriodName(item.periode)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#4731B6] text-white"
                              : "border border-gray-200 text-[#3F3F3F] hover:bg-gray-50"
                          }`}
                        >
                          {isSelected ? "Dipilih" : "Lihat"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSlip(item.periode)}
                          className="p-1.5 rounded-lg border border-gray-200 text-[#4731B6] hover:bg-[#F2F1F9] transition-colors cursor-pointer"
                          title="Unduh Slip Gaji PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajukan Banding Gaji */}
      {showAppealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Pengajuan Banding Gaji · {activePeriod.periode}
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
                  Banding gaji untuk <strong>Periode {activePeriod.periode}</strong> akan diverifikasi oleh HRD dan diteruskan ke Manajemen Keuangan dalam 3 hari kerja.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Periode Gaji yang Disengketakan
                </label>
                <input
                  type="text"
                  disabled
                  value={activePeriod.periode}
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
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pengajuan Banding</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
