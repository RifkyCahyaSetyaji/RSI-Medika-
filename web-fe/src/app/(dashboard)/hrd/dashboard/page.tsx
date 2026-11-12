"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Clock,
  FileText,
  BookOpen,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Building2,
  Calendar,
  AlertCircle,
  Activity,
} from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import { StatusBadge } from "@/shared/components/ui/status-badge";

export default function HRDDashboard() {
  const { user } = useAuth();
  const todayFormatted = "Selasa, 10 Oktober 2026";

  const weeklyAttendance = [
    { day: "Sen", percent: 96.2, present: 238 },
    { day: "Sel", percent: 94.8, present: 235, active: true },
    { day: "Rab", percent: 97.0, present: 240 },
    { day: "Kam", percent: 95.5, present: 236 },
    { day: "Jum", percent: 93.8, present: 232 },
    { day: "Sab", percent: 91.2, present: 198 },
    { day: "Min", percent: 89.5, present: 185 },
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
              Sistem SDM Aktif & Terintegrasi
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
            Selamat pagi, {user?.nama?.split(" ")[0] || "Athaya"}!
          </h2>
          <p className="text-xs sm:text-sm text-[#5F5F5F] leading-relaxed max-w-md pt-1">
            Monitoring kepegawaian, verifikasi pengajuan cuti, absensi staf, dan penanganan banding kompensasi rumah sakit.
          </p>
        </div>
      </div>

      {/* 2. HRD Stat Cards (4 Main Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Pegawai Aktif */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Total Pegawai Aktif</span>
            <Users className="w-4 h-4 text-[#4731B6]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#4731B6] tracking-tight">
              248
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +4 rekrutmen baru bulan ini
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#4731B6] h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </div>

        {/* Metric 2: Tingkat Kehadiran RS */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Kehadiran Hari Ini</span>
            <UserCheck className="w-4 h-4 text-[#4731B6]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#202020] tracking-tight">
              94.8%
            </div>
            <p className="text-[11px] text-[#5F5F5F] font-medium mt-0.5">
              235 Hadir · 8 Izin/Sakit · 5 Cuti
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0E6100] h-full rounded-full" style={{ width: "94.8%" }} />
          </div>
        </div>

        {/* Metric 3: Dokumen Menunggu Verifikasi */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Banding & Pengajuan</span>
            <AlertCircle className="w-4 h-4 text-[#F39C12]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F39C12] tracking-tight">
              14 Berkas
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-0.5">
              4 Banding Gaji · 10 Izin/Cuti
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F39C12] h-full rounded-full" style={{ width: "70%" }} />
          </div>
        </div>

        {/* Metric 4: Kepatuhan Jam Kerja */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Kepatuhan On-Time</span>
            <Activity className="w-4 h-4 text-[#0E6100]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0E6100] tracking-tight">
              97.1%
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +1.8% dari bulan lalu
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0E6100] h-full rounded-full" style={{ width: "97.1%" }} />
          </div>
        </div>
      </div>

      {/* 3. Visual Statistik: Komposisi SDM & Tren Kehadiran Mingguan RS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Komposisi Staf Medis & Unit (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-black/5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-base text-[#202020] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#4731B6]" />
                <span>Distribusi Tenaga Medis per Divisi</span>
              </h3>
              <p className="text-xs text-[#7E7E7E]">Total 248 pegawai terdaftar di Rumah Sakit</p>
            </div>
            <Link href="/hrd/kepegawaian" className="text-xs font-semibold text-[#4731B6] hover:underline">
              Kelola
            </Link>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Keperawatan (Rawat Inap, OK, IGD)</span>
                <span className="text-[#4731B6] font-bold">146 Staf (58.9%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#4731B6] h-full rounded-full" style={{ width: "58.9%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Dokter Spesialis & Umum</span>
                <span className="text-[#3B289E] font-bold">42 Dokter (16.9%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#8D7BE4] h-full rounded-full" style={{ width: "16.9%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Penunjang Medis (Farmasi, Lab, Radiologi)</span>
                <span className="text-[#0E6100] font-bold">35 Staf (14.1%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0E6100] h-full rounded-full" style={{ width: "14.1%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Manajemen, Keuangan & Administrasi</span>
                <span className="text-[#7E7E7E] font-bold">25 Staf (10.1%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#7E7E7E] h-full rounded-full" style={{ width: "10.1%" }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F2F1F9] rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#5F5F5F]">Status Kepegawaian:</span>
            <span className="font-bold text-[#4731B6]">182 Pegawai Tetap · 66 PKWT / Kontrak</span>
          </div>
        </div>

        {/* Right: Bar Chart Tren Kehadiran Mingguan RS (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-black/5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-base text-[#202020] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4731B6]" />
                <span>Statistik Kehadiran Mingguan RS</span>
              </h3>
              <p className="text-xs text-[#7E7E7E]">Rata-rata kehadiran: <strong>94.2%</strong> per shift</p>
            </div>
            <Link href="/hrd/absensi" className="text-xs font-semibold text-[#4731B6] hover:underline">
              Rekap Lengkap
            </Link>
          </div>

          {/* Bar Chart */}
          <div className="pt-3 flex items-end justify-between gap-2 h-40 border-b border-gray-100 pb-2">
            {weeklyAttendance.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-[#4731B6] opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.percent}%
                </span>
                <div
                  className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${
                    item.active
                      ? "bg-[#4731B6] shadow-md shadow-[#4731B6]/30"
                      : "bg-[#8D7BE4] hover:bg-[#4731B6]"
                  }`}
                  style={{ height: `${item.percent - 20}%` }}
                />
                <span className={`text-xs font-semibold ${item.active ? "text-[#4731B6] font-bold" : "text-[#7E7E7E]"}`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          {/* Shift Monitoring Row */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="block text-xs font-bold text-[#4731B6]">112 Staf</span>
              <span className="text-[10px] text-[#7E7E7E]">Shift Pagi</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="block text-xs font-bold text-[#3B289E]">74 Staf</span>
              <span className="text-[10px] text-[#7E7E7E]">Shift Siang</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="block text-xs font-bold text-[#0E6100]">42 Staf</span>
              <span className="text-[10px] text-[#7E7E7E]">Shift Malam</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Link
          href="/hrd/kepegawaian"
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 flex items-center gap-3.5 hover:border-[#4731B6] transition-colors group"
        >
          <div className="p-2.5 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
              Kepegawaian
            </h4>
            <p className="text-[11px] text-[#7E7E7E] truncate">Kelola data 248 pegawai</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
        </Link>

        <Link
          href="/hrd/aju-banding"
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 flex items-center gap-3.5 hover:border-[#4731B6] transition-colors group"
        >
          <div className="p-2.5 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
              Aju Banding
            </h4>
            <p className="text-[11px] text-[#7E7E7E] truncate">14 berkas menunggu</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
        </Link>

        <Link
          href="/hrd/absensi"
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 flex items-center gap-3.5 hover:border-[#4731B6] transition-colors group"
        >
          <div className="p-2.5 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
              Rekap Absensi
            </h4>
            <p className="text-[11px] text-[#7E7E7E] truncate">Presensi seluruh staf RS</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
        </Link>

        <Link
          href="/hrd/pedoman-gaji"
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 flex items-center gap-3.5 hover:border-[#4731B6] transition-colors group"
        >
          <div className="p-2.5 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
              Pedoman Gaji
            </h4>
            <p className="text-[11px] text-[#7E7E7E] truncate">Atur skema upah & tunjangan</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
        </Link>
      </div>

      {/* 5. Aktivitas Terbaru */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-[#202020]">Aktivitas & Log Pengajuan Terbaru</h3>
          <Link href="/hrd/kepegawaian" className="text-xs font-semibold text-[#4731B6] hover:underline">
            Lihat semua log
          </Link>
        </div>

        <div className="bg-white rounded-[24px] shadow-xs border border-black/5 divide-y divide-gray-100 overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
            <div className="min-w-0">
              <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                Pengajuan Banding Gaji · Ns. Ayu Lestari (Tunjangan Shift Malam)
              </h5>
              <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-1">Hari ini · 09.24 · Unit Rawat Inap</p>
            </div>
            <StatusBadge status="Diproses" />
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
            <div className="min-w-0">
              <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                Pengajuan Cuti Tahunan · dr. Hendra Wijaya, Sp.A (3 Hari)
              </h5>
              <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-1">Kemarin · 15.12 · Poliklinik Anak</p>
            </div>
            <StatusBadge status="Disetujui" />
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
            <div className="min-w-0">
              <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                Koreksi Presensi Fingerprint · Bima Pratama, A.Md.Kep.
              </h5>
              <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-1">08 Mei 2025 · 10.45 · Shift Siang</p>
            </div>
            <StatusBadge status="Disetujui" />
          </div>
        </div>
      </div>
    </div>
  );
}
