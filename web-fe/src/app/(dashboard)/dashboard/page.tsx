"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  Clock,
  MapPin,
  Fingerprint,
  ChevronRight,
  Wallet,
  Receipt,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import { StatusBadge } from "@/shared/components/ui/status-badge";

export default function DashboardPage() {
  const { role, user } = useAuth();

  // Current display date
  const todayFormatted = "Selasa, 10 Oktober 2026";
  const getDisplayName = (fullName?: string) => {
    if (!fullName) return "Athaya";
    const parts = fullName.split(" ");
    if (parts[0].startsWith("Ns.") || parts[0].startsWith("dr.") || parts[0].startsWith("drg.")) {
      return parts[1] || parts[0];
    }
    return parts[0];
  };
  const displayName = getDisplayName(user?.nama);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Welcome Hero Banner */}
      <div className="relative w-full min-h-[170px] sm:min-h-[200px] bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-8 md:p-10 shadow-xs border border-black/5 overflow-hidden flex flex-col justify-center">
        {/* Hospital Building Image on right side */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 md:w-5/12 overflow-hidden pointer-events-none hidden sm:block">
          <Image
            src="/images/hospital-building.png"
            alt="Hospital Exterior"
            fill
            className="object-cover object-left"
            priority
          />
          {/* Subtle gradient feathering from left */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
        </div>

        {/* Text content */}
        <div className="relative z-10 max-w-xl space-y-1.5 sm:space-y-2">
          <span className="text-xs sm:text-sm font-normal text-[#5F5F5F]">
            {todayFormatted}
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
            Selamat pagi, {displayName}!
          </h2>
          <p className="text-xs sm:text-sm text-[#5F5F5F] leading-relaxed max-w-md pt-0.5 sm:pt-1">
            Setiap langkah yang kamu lakukan hari ini, berkontribusi besar untuk pelayanan yang lebih baik. Tetap semangat dan jaga kesehatan.
          </p>
        </div>
      </div>

      {/* 2. Role-Specific Content */}
      {role === "TENAGA_MEDIS" && (
        <div className="space-y-5 sm:space-y-6">
          {/* Section: Rekap Kehadiran Bulan Ini */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#202020]">
              <FileText className="w-5 h-5 text-[#4731B6]" />
              <h3>Rekap Kehadiran Bulan Ini</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">18</span>
                <p className="text-xs font-medium text-[#7E7E7E]">Hadir</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">1</span>
                <p className="text-xs font-medium text-[#7E7E7E]">Tidak Hadir</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">2</span>
                <p className="text-xs font-medium text-[#7E7E7E]">Terlambat</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">1</span>
                <p className="text-xs font-medium text-[#7E7E7E]">Izin / Sakit</p>
              </div>
            </div>
          </div>

          {/* 2-Columns: Jadwal Hari ini & Pengajuan Terbaru */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* Jadwal Hari Ini (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-[#202020]">Jadwal Hari ini</h3>

              <div className="bg-[#4731B6] rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 text-white shadow-sm flex flex-col justify-between min-h-[200px] sm:min-h-[220px]">
                <div className="space-y-4">
                  <h4 className="text-lg sm:text-xl font-bold tracking-tight">Shift Pagi</h4>

                  <div className="space-y-2 text-xs sm:text-sm text-white/90">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-white/80 shrink-0" />
                      <span>07.00–14.00</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-white/80 shrink-0" />
                      <span className="truncate">{user?.unit || "Unit Rawat Inap"}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/absensi"
                  className="mt-5 sm:mt-6 flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 px-4 bg-white hover:bg-gray-50 text-[#4731B6] font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Absen sekarang</span>
                </Link>
              </div>
            </div>

            {/* Pengajuan Terbaru (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-[#202020]">Pengajuan terbaru</h3>
                <Link
                  href="/absensi"
                  className="text-xs font-semibold text-[#4731B6] hover:underline"
                >
                  Lihat semua
                </Link>
              </div>

              <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-xs border border-black/5 divide-y divide-gray-100 overflow-hidden">
                <div className="p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                      Cuti tahunan
                    </h5>
                    <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-0.5">20–22 Mei 2025</p>
                  </div>
                  <StatusBadge status="Disetujui" />
                </div>

                <div className="p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                      Izin keperluan keluarga
                    </h5>
                    <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-0.5">15 Mei 2025</p>
                  </div>
                  <StatusBadge status="Menunggu" />
                </div>

                <div className="p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                      Banding tunjangan
                    </h5>
                    <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-0.5">Periode April 2025</p>
                  </div>
                  <StatusBadge status="Diproses" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HRD DASHBOARD VIEW */}
      {role === "HRD" && (
        <div className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">248</span>
              <p className="text-xs font-medium text-[#7E7E7E]">Pegawai aktif</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">94%</span>
              <p className="text-xs font-medium text-[#7E7E7E]">Kehadiran</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">14</span>
              <p className="text-xs font-medium text-[#7E7E7E]">Banding menunggu</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">6</span>
              <p className="text-xs font-medium text-[#7E7E7E]">Data perlu diperbarui</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-[#202020]">Aktivitas Terbaru</h3>
              <Link href="/kepegawaian" className="text-xs font-semibold text-[#4731B6] hover:underline">
                Lihat semua
              </Link>
            </div>

            <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-xs border border-black/5 divide-y divide-gray-100 overflow-hidden">
              <div className="p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                    Pengajuan Ns. Rani Oktavia
                  </h5>
                  <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-0.5">Hari ini · 09.24</p>
                </div>
                <StatusBadge status="Diproses" />
              </div>

              <div className="p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                    Perubahan jadwal Shift Pagi
                  </h5>
                  <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-0.5">Kemarin · 15.12</p>
                </div>
                <StatusBadge status="Disetujui" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SEKRETARIS UNIT DASHBOARD VIEW */}
      {role === "SEKRETARIS" && (
        <div className="space-y-5 sm:space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#202020]">
              <FileText className="w-5 h-5 text-[#4731B6]" />
              <h3>Rekap Kehadiran Bulan Ini</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">42</span>
                <p className="text-xs font-medium text-[#7E7E7E]">Tenaga Medis Aktif</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">6</span>
                <p className="text-xs font-medium text-[#7E7E7E]">Shift Hari ini</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">8</span>
                <p className="text-xs font-medium text-[#7E7E7E]">Pengajuan Menunggu</p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">96%</span>
                <p className="text-xs font-medium text-[#7E7E7E]">Kehadiran Unit</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-[#202020]">Aktivitas Terbaru</h3>
              <Link href="/kelola-jadwal" className="text-xs font-semibold text-[#4731B6] hover:underline">
                Lihat semua
              </Link>
            </div>

            <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-xs border border-black/5 divide-y divide-gray-100 overflow-hidden">
              <div className="p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                    Pengajuan Ns. Rani Oktavia
                  </h5>
                  <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-0.5">Hari ini · 09.24</p>
                </div>
                <StatusBadge status="Diproses" />
              </div>

              <div className="p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                    Perubahan jadwal Shift Pagi
                  </h5>
                  <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-0.5">Kemarin · 15.12</p>
                </div>
                <StatusBadge status="Disetujui" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. KEUANGAN DASHBOARD VIEW */}
      {role === "KEUANGAN" && (
        <div className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">156</span>
              <p className="text-xs font-medium text-[#7E7E7E]">Gaji diproses</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">12</span>
              <p className="text-xs font-medium text-[#7E7E7E]">Banding menunggu</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#4731B6] truncate block">
                Rp 1,2 M
              </span>
              <p className="text-xs font-medium text-[#7E7E7E]">Total penggajian</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
              <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">98%</span>
              <p className="text-xs font-medium text-[#7E7E7E]">Pembayaran selesai</p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link
              href="/gaji"
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 flex items-center gap-3.5 sm:gap-4 hover:border-[#4731B6] transition-colors group"
            >
              <div className="p-3 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
                  Kelola Gaji
                </h4>
                <p className="text-[11px] sm:text-xs text-[#7E7E7E] truncate">Proses dan lihat log penggajian</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
            </Link>

            <Link
              href="/aju-banding"
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 flex items-center gap-3.5 sm:gap-4 hover:border-[#4731B6] transition-colors group"
            >
              <div className="p-3 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
                  Aju Banding
                </h4>
                <p className="text-[11px] sm:text-xs text-[#7E7E7E] truncate">Tindak lanjut pembayaran tambahan</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
            </Link>

            <Link
              href="/pedoman-gaji"
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 flex items-center gap-3.5 sm:gap-4 hover:border-[#4731B6] transition-colors group sm:col-span-2 lg:col-span-1"
            >
              <div className="p-3 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
                  Pedoman Gaji
                </h4>
                <p className="text-[11px] sm:text-xs text-[#7E7E7E] truncate">Baca ketentuan penggajian</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-[#202020]">Aktivitas Terbaru</h3>
              <Link href="/gaji" className="text-xs font-semibold text-[#4731B6] hover:underline">
                Lihat semua
              </Link>
            </div>

            <div className="bg-white rounded-[20px] sm:rounded-[24px] shadow-xs border border-black/5 divide-y divide-gray-100 overflow-hidden">
              <div className="p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                    Penggajian Mei 2025 diproses
                  </h5>
                  <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-0.5">Hari ini · 09.24</p>
                </div>
                <StatusBadge status="Diproses" />
              </div>

              <div className="p-3.5 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                    Perubahan jadwal Shift Pagi
                  </h5>
                  <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-0.5">Kemarin · 15.12</p>
                </div>
                <StatusBadge status="Disetujui" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
