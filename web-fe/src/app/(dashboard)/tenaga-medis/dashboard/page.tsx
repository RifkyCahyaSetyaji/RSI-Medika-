"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Fingerprint,
  Calendar,
  Wallet,
  TrendingUp,
  Award,
  ChevronRight,
  UserCheck,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import { StatusBadge } from "@/shared/components/ui/status-badge";

export default function TenagaMedisDashboard() {
  const { user } = useAuth();
  const todayFormatted = "Selasa, 10 Oktober 2026";

  const getDisplayName = (fullName?: string) => {
    if (!fullName) return "Ayu";
    const parts = fullName.split(" ");
    if (parts[0].startsWith("Ns.") || parts[0].startsWith("dr.") || parts[0].startsWith("drg.")) {
      return parts[1] || parts[0];
    }
    return parts[0];
  };

  const displayName = getDisplayName(user?.nama);

  // Weekly hours data for visual chart
  const weeklyHours = [
    { day: "Sen", hours: 7, target: 7, active: false },
    { day: "Sel", hours: 7, target: 7, active: true },
    { day: "Rab", hours: 8, target: 7, active: false },
    { day: "Kam", hours: 7, target: 7, active: false },
    { day: "Jum", hours: 7, target: 7, active: false },
    { day: "Sab", hours: 0, target: 7, isOff: true, active: false },
    { day: "Min", hours: 0, target: 7, isOff: true, active: false },
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
              On Duty Shift Pagi
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
            Selamat pagi, {displayName}!
          </h2>
          <p className="text-xs sm:text-sm text-[#5F5F5F] leading-relaxed max-w-md pt-1">
            Setiap langkah dan dedikasi kamu hari ini berkontribusi besar bagi kesembuhan pasien. Tetap semangat dan selalu utamakan keselamatan kerja.
          </p>
        </div>
      </div>

      {/* 2. Statistik Kinerja & Kehadiran Utama (4 Metric Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Stat 1: Kehadiran */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Tingkat Kehadiran</span>
            <UserCheck className="w-4 h-4 text-[#4731B6]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#4731B6] tracking-tight">
              95.2%
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 18 Hadir · 0 Mangkir
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#4731B6] h-full rounded-full" style={{ width: "95.2%" }} />
          </div>
        </div>

        {/* Stat 2: Total Jam Kerja */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Jam Kerja Bulan Ini</span>
            <Timer className="w-4 h-4 text-[#4731B6]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#202020] tracking-tight">
              144 <span className="text-xs font-normal text-[#7E7E7E]">/ 160 jam</span>
            </div>
            <p className="text-[11px] text-[#4731B6] font-medium mt-0.5">
              +8 jam lembur terhitung
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0E6100] h-full rounded-full" style={{ width: "90%" }} />
          </div>
        </div>

        {/* Stat 3: On-Time / Kedisiplinan */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Skor Kedisiplinan</span>
            <Award className="w-4 h-4 text-[#4731B6]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0E6100] tracking-tight">
              98 / 100
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-0.5">
              Rata-rata tiba 06.52 WIB (Tepat waktu)
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0E6100] h-full rounded-full" style={{ width: "98%" }} />
          </div>
        </div>

        {/* Stat 4: Gaji Terakhir yang Didapatkan */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Gaji yang Didapatkan</span>
            <Wallet className="w-4 h-4 text-[#4731B6]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#4731B6] tracking-tight">
              Rp 6.880.000
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Periode Mei 2025 (Lunas)
            </p>
          </div>
          <Link
            href="/tenaga-medis/gaji"
            className="text-[11px] font-semibold text-[#4731B6] hover:underline flex items-center justify-between"
          >
            <span>Rincian Komponen</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. Visual Statistik: Jam Kerja Mingguan & Distribusi Shift */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Bar Chart Jam Kerja Mingguan (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-base text-[#202020] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4731B6]" />
                <span>Statistik Jam Kerja Mingguan</span>
              </h3>
              <p className="text-xs text-[#7E7E7E]">
                Total minggu ini: <strong>36 Jam</strong> · Rata-rata: <strong>7.2 jam / hari</strong>
              </p>
            </div>
            <span className="text-xs font-semibold text-[#4731B6] bg-[#F2F1F9] px-2.5 py-1 rounded-lg">
              Minggu ke-2 Mei
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 flex items-end justify-between gap-2 sm:gap-4 h-40 border-b border-gray-100 pb-2">
            {weeklyHours.map((item, idx) => {
              const heightPercent = item.isOff ? 8 : (item.hours / 9) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-[#4731B6] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.isOff ? "Libur" : `${item.hours}h`}
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${
                      item.active
                        ? "bg-[#4731B6] shadow-md shadow-[#4731B6]/30"
                        : item.isOff
                        ? "bg-gray-100"
                        : "bg-[#8D7BE4] hover:bg-[#4731B6]"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className={`text-xs font-semibold ${item.active ? "text-[#4731B6] font-bold" : "text-[#7E7E7E]"}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 text-[#5F5F5F]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#4731B6]" />
              <span>Hari ini (Shift Pagi)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#8D7BE4]" />
              <span>Shift Selesai</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-gray-200" />
              <span>Hari Libur</span>
            </div>
          </div>
        </div>

        {/* Right: Distribusi Shift & Kebugaran (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-black/5 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm sm:text-base text-[#202020] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4731B6]" />
              <span>Komposisi Shift Bulan Ini</span>
            </h3>
            <p className="text-xs text-[#7E7E7E]">Total 20 shift terjadwal di bulan Mei</p>
          </div>

          {/* Shift Breakdown Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Shift Pagi (07.00 - 14.00)</span>
                <span className="text-[#4731B6] font-bold">10 Shift (50%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#4731B6] h-full rounded-full" style={{ width: "50%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Shift Siang (14.00 - 21.00)</span>
                <span className="text-[#3B289E] font-bold">7 Shift (35%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#8D7BE4] h-full rounded-full" style={{ width: "35%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Shift Malam (21.00 - 07.00)</span>
                <span className="text-[#0E6100] font-bold">3 Shift (15%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0E6100] h-full rounded-full" style={{ width: "15%" }} />
              </div>
            </div>
          </div>

          {/* Quick Leave Allowance Box */}
          <div className="p-3 bg-[#F2F1F9] rounded-xl flex items-center justify-between text-xs border border-[#C4BAF5]/40">
            <div>
              <span className="font-semibold text-[#202020] block">Sisa Hak Cuti Tahunan</span>
              <span className="text-[#7E7E7E] text-[11px]">Telah digunakan 3 dari 12 hari</span>
            </div>
            <span className="font-extrabold text-sm text-[#4731B6] bg-white px-2.5 py-1 rounded-lg shadow-2xs">
              9 Hari Tersisa
            </span>
          </div>
        </div>
      </div>

      {/* 4. Jadwal Hari ini & Pengajuan Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Jadwal Hari Ini (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h3 className="text-sm sm:text-base font-bold text-[#202020]">Jadwal Hari ini</h3>

          <div className="bg-[#4731B6] rounded-[24px] p-6 text-white shadow-sm flex flex-col justify-between min-h-[240px]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg sm:text-xl font-bold tracking-tight">Shift Pagi</h4>
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  Bangsal 3A
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-white/90">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-white/80 shrink-0" />
                  <span>07.00–14.00 WIB (Aktif)</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-white/80 shrink-0" />
                  <span className="truncate">{user?.unit || "Unit Rawat Inap"} · Kamar 301-308</span>
                </div>
                <div className="flex items-center gap-3 text-white/80 text-xs">
                  <Award className="w-4 h-4 text-white/80 shrink-0" />
                  <span>Karu Pendamping: Ns. Siti Aminah, S.Kep.</span>
                </div>
              </div>
            </div>

            <Link
              href="/tenaga-medis/absensi"
              className="mt-6 flex items-center justify-center gap-2 w-full h-12 px-4 bg-white hover:bg-gray-50 text-[#4731B6] font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Absen Masuk / Pulang Sekarang</span>
            </Link>
          </div>
        </div>

        {/* Pengajuan Terbaru (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-[#202020]">Pengajuan & Notifikasi Terbaru</h3>
            <Link
              href="/tenaga-medis/absensi"
              className="text-xs font-semibold text-[#4731B6] hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          <div className="bg-white rounded-[24px] shadow-xs border border-black/5 divide-y divide-gray-100 overflow-hidden">
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="min-w-0">
                <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                  Cuti tahunan (3 Hari Kerja)
                </h5>
                <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-1">20–22 Mei 2025 · Unit Rawat Inap</p>
              </div>
              <StatusBadge status="Disetujui" />
            </div>

            <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="min-w-0">
                <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                  Izin keperluan keluarga mendesak
                </h5>
                <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-1">15 Mei 2025 · Shift Pagi</p>
              </div>
              <StatusBadge status="Menunggu" />
            </div>

            <div className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="min-w-0">
                <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                  Banding insentif tugas jaga malam
                </h5>
                <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-1">Periode April 2025 · Selisih Rp 350.000</p>
              </div>
              <StatusBadge status="Diproses" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
