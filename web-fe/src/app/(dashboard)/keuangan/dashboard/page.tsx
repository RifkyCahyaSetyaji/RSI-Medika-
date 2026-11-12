"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Wallet,
  Receipt,
  BookOpen,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import { StatusBadge } from "@/shared/components/ui/status-badge";

export default function KeuanganDashboard() {
  const { user } = useAuth();
  const todayFormatted = "Selasa, 10 Oktober 2026";

  const monthlyPayrollTrend = [
    { month: "Jan", total: 1140, label: "Rp 1,14 M" },
    { month: "Feb", total: 1152, label: "Rp 1,15 M" },
    { month: "Mar", total: 1165, label: "Rp 1,16 M" },
    { month: "Apr", total: 1172, label: "Rp 1,17 M" },
    { month: "Mei", total: 1182.5, label: "Rp 1,18 M", active: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Welcome Hero Banner */}
      <div className="relative w-full min-h-[192px] bg-white rounded-[28px] p-6 sm:p-8 lg:p-10 shadow-xs border border-black/5 overflow-hidden flex flex-col justify-center">
        {/* Hospital Building Image */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 md:w-5/12 overflow-hidden pointer-events-none hidden sm:block">
          <Image
            src="/images/hospital-building.png"
            alt="Hospital Exterior"
            fill
            className="object-cover object-left"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
        </div>

        {/* Text content */}
        <div className="relative z-10 max-w-xl flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-normal text-[#5F5F5F]">
              {todayFormatted}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D8F0D3] text-[#0E6100]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E6100] animate-pulse" />
              Siklus Payroll Periode Mei 2025 Aktif
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
            Selamat pagi, {user?.nama?.split(" ")[0] || "Bambang"}!
          </h2>
          <p className="text-xs sm:text-sm text-[#5F5F5F] leading-relaxed max-w-md pt-1">
            Realisasi penggajian staf, rekonsiliasi transfer bank, kepatuhan potongan pajak BPJS, dan penyelesaian sengketa tunjangan.
          </p>
        </div>
      </div>

      {/* 2. Keuangan Stat Cards (4 Main Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Total Realisasi Gaji Disalurkan */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Gaji yang Disalurkan</span>
            <Wallet className="w-4 h-4 text-[#4731B6]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#4731B6] tracking-tight truncate">
              Rp 1,182 M
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 98.5% dari pagu anggaran
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#4731B6] h-full rounded-full" style={{ width: "98.5%" }} />
          </div>
        </div>

        {/* Metric 2: Pegawai Sudah Menerima Gaji */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Pegawai Telah Terbayar</span>
            <CreditCard className="w-4 h-4 text-[#4731B6]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#202020] tracking-tight">
              244 <span className="text-xs font-normal text-[#7E7E7E]">/ 248 Staf</span>
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-0.5">
              4 pegawai proses verifikasi bank
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0E6100] h-full rounded-full" style={{ width: "98.4%" }} />
          </div>
        </div>

        {/* Metric 3: Total Potongan Pajak & BPJS */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Total Potongan & BPJS</span>
            <DollarSign className="w-4 h-4 text-[#9A2500]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#9A2500] tracking-tight truncate">
              Rp 175,4 Jt
            </div>
            <p className="text-[11px] text-[#5F5F5F] font-medium mt-0.5">
              PPh 21, BPJS Kes & Naker RS
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#9A2500] h-full rounded-full" style={{ width: "85%" }} />
          </div>
        </div>

        {/* Metric 4: Sengketa Banding Menunggu */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Banding Menunggu</span>
            <AlertCircle className="w-4 h-4 text-[#F39C12]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F39C12] tracking-tight">
              12 Berkas
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-0.5">
              Estimasi sengketa: Rp 4,2 Juta
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F39C12] h-full rounded-full" style={{ width: "60%" }} />
          </div>
        </div>
      </div>

      {/* 3. Visual Statistik: Distribusi Beban Gaji & Tren Pengeluaran Bulanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Alokasi Beban Gaji per Unit (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-black/5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-base text-[#202020] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#4731B6]" />
                <span>Alokasi Beban Penggajian per Unit</span>
              </h3>
              <p className="text-xs text-[#7E7E7E]">Total realisasi: <strong>Rp 1.182.500.000</strong></p>
            </div>
            <Link href="/keuangan/kelola-gaji" className="text-xs font-semibold text-[#4731B6] hover:underline">
              Kelola
            </Link>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Unit Rawat Inap & ICU (146 Staf)</span>
                <span className="text-[#4731B6] font-bold">Rp 640 Juta (54.1%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#4731B6] h-full rounded-full" style={{ width: "54.1%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Dokter Spesialis & Poliklinik (42 Staf)</span>
                <span className="text-[#3B289E] font-bold">Rp 310 Juta (26.2%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#8D7BE4] h-full rounded-full" style={{ width: "26.2%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Penunjang Medis (Farmasi & Lab) (35 Staf)</span>
                <span className="text-[#0E6100] font-bold">Rp 142 Juta (12.0%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#0E6100] h-full rounded-full" style={{ width: "12%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Manajemen & Administrasi (25 Staf)</span>
                <span className="text-[#7E7E7E] font-bold">Rp 90,5 Juta (7.7%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#7E7E7E] h-full rounded-full" style={{ width: "7.7%" }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F2F1F9] rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#5F5F5F]">Bank Payroll Mandiri H2H:</span>
            <span className="font-bold text-[#0E6100] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Rekonsiliasi Kliring
            </span>
          </div>
        </div>

        {/* Right: Bar Chart Tren Pengeluaran Bulanan (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-black/5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-base text-[#202020] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4731B6]" />
                <span>Tren Pengeluaran Payroll 5 Bulan Terakhir</span>
              </h3>
              <p className="text-xs text-[#7E7E7E]">Pertumbuhan stabil: <strong>+3.7%</strong> YTD</p>
            </div>
            <span className="text-xs font-bold text-[#4731B6] bg-[#F2F1F9] px-2.5 py-1 rounded-lg">
              Tahun 2025
            </span>
          </div>

          {/* Bar Chart */}
          <div className="pt-3 flex items-end justify-between gap-3 h-40 border-b border-gray-100 pb-2">
            {monthlyPayrollTrend.map((item, idx) => {
              const height = ((item.total - 1100) / 100) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-[#4731B6] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.label}
                  </span>
                  <div
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                      item.active
                        ? "bg-[#4731B6] shadow-md shadow-[#4731B6]/30"
                        : "bg-[#8D7BE4] hover:bg-[#4731B6]"
                    }`}
                    style={{ height: `${Math.max(25, height)}%` }}
                  />
                  <span className={`text-xs font-semibold ${item.active ? "text-[#4731B6] font-bold" : "text-[#7E7E7E]"}`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] text-[#7E7E7E] block">Rata-rata Penggajian Bulanan</span>
              <span className="font-bold text-sm text-[#202020]">Rp 1,162 Miliar</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] text-[#7E7E7E] block">Sisa Alokasi Anggaran Q2</span>
              <span className="font-bold text-sm text-[#0E6100]">Rp 2,417 Miliar</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/keuangan/kelola-gaji"
          className="bg-white rounded-2xl p-5 shadow-xs border border-black/5 flex items-center gap-4 hover:border-[#4731B6] transition-colors group"
        >
          <div className="p-3 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
              Kelola Gaji Staf
            </h4>
            <p className="text-xs text-[#7E7E7E] truncate">Proses payroll 248 pegawai RS</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
        </Link>

        <Link
          href="/keuangan/aju-banding"
          className="bg-white rounded-2xl p-5 shadow-xs border border-black/5 flex items-center gap-4 hover:border-[#4731B6] transition-colors group"
        >
          <div className="p-3 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
              Aju Banding
            </h4>
            <p className="text-xs text-[#7E7E7E] truncate">12 berkas sengketa upah</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
        </Link>

        <Link
          href="/keuangan/pedoman-gaji"
          className="bg-white rounded-2xl p-5 shadow-xs border border-black/5 flex items-center gap-4 hover:border-[#4731B6] transition-colors group"
        >
          <div className="p-3 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
              Pedoman Gaji
            </h4>
            <p className="text-xs text-[#7E7E7E] truncate">Atur skema upah & standar gaji</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
        </Link>
      </div>

      {/* 5. Aktivitas Terbaru */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-[#202020]">Aktivitas & Log Payroll Terbaru</h3>
          <Link href="/keuangan/kelola-gaji" className="text-xs font-semibold text-[#4731B6] hover:underline">
            Lihat semua
          </Link>
        </div>

        <div className="bg-white rounded-[24px] shadow-xs border border-black/5 divide-y divide-gray-100 overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
            <div className="min-w-0">
              <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                Disbursement Batch Payroll Periode Mei 2025 ke 244 Rekening Mandiri
              </h5>
              <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-1">Hari ini · 09.24 · Host-to-Host Berhasil</p>
            </div>
            <StatusBadge status="Terbayar" />
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
            <div className="min-w-0">
              <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                Banding potongan absensi disetujui · Ns. Ayu Lestari (+ Rp 120.000)
              </h5>
              <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-1">Kemarin · 15.12 · Penyesuaian Payroll Juni</p>
            </div>
            <StatusBadge status="Disetujui" />
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
            <div className="min-w-0">
              <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                Koreksi rekonsiliasi transfer kliring BNI · Ns. Dewi Sartika
              </h5>
              <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-1">08 Mei 2025 · 11.20 · Menunggu validasi nomor rekening</p>
            </div>
            <StatusBadge status="Diproses" />
          </div>
        </div>
      </div>
    </div>
  );
}
