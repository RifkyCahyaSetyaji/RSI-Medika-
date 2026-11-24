"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { dashboardService } from "@/shared/services/api/dashboard.service";
import { HrdDashboardData } from "@/shared/types/api";

function getFormattedDate(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HRDDashboard() {
  const { user } = useAuth();
  const [todayFormatted] = useState<string>(getFormattedDate);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<HrdDashboardData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await dashboardService.getHrdDashboard();
        if (isMounted && res) {
          setData(res);
        }
      } catch (err) {
        console.error("Gagal memuat dashboard HRD dari backend:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = data?.metrics || {
    totalPegawaiAktif: 0,
    rekrutmenBaruBulanIni: 0,
    tingkatKehadiranHariIni: 0,
    kehadiranDetail: { hadir: 0, izinSakit: 0, cuti: 0 },
    pendingBandingCount: 0,
    totalPedomanCount: 0,
    pegawaiTanpaAkunCount: 0,
    kepatuhanOnTime: 0,
  };

  const distribusiDivisi = data?.distribusiDivisi || [];
  const statusKepegawaian = data?.statusKepegawaian || { tetap: 0, kontrak: 0 };
  const weeklyAttendance = data?.trenKehadiranMingguan || [];
  const shiftMonitoring = data?.shiftMonitoring || { pagi: 0, siang: 0, malam: 0 };
  const recentActivities = data?.recentActivities || [];

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
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#4731B6] font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Sinkron data...
              </span>
            )}
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
              {metrics.totalPegawaiAktif}
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +{metrics.rekrutmenBaruBulanIni} rekrutmen bulan ini
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
              {metrics.tingkatKehadiranHariIni}%
            </div>
            <p className="text-[11px] text-[#5F5F5F] font-medium mt-0.5">
              {metrics.kehadiranDetail.hadir} Hadir · {metrics.kehadiranDetail.izinSakit} Izin/Sakit · {metrics.kehadiranDetail.cuti} Cuti
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0E6100] h-full rounded-full" style={{ width: `${Math.min(metrics.tingkatKehadiranHariIni, 100)}%` }} />
          </div>
        </div>

        {/* Metric 3: Dokumen Menunggu Verifikasi */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Banding Gaji Aktif</span>
            <AlertCircle className="w-4 h-4 text-[#F39C12]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F39C12] tracking-tight">
              {metrics.pendingBandingCount} Berkas
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-0.5">
              {metrics.totalPedomanCount} Pedoman Gaji Terbit
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F39C12] h-full rounded-full" style={{ width: `${Math.min(metrics.pendingBandingCount * 20, 100)}%` }} />
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
              {metrics.kepatuhanOnTime}%
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Rekapitulasi staf bulan ini
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0E6100] h-full rounded-full" style={{ width: `${Math.min(metrics.kepatuhanOnTime, 100)}%` }} />
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
              <p className="text-xs text-[#7E7E7E]">Total {metrics.totalPegawaiAktif} pegawai terdaftar di Rumah Sakit</p>
            </div>
            <Link href="/hrd/kepegawaian" className="text-xs font-semibold text-[#4731B6] hover:underline">
              Kelola
            </Link>
          </div>

          <div className="space-y-3">
            {distribusiDivisi.length > 0 ? (
              distribusiDivisi.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-[#202020] font-semibold">{item.nama}</span>
                    <span className="text-[#4731B6] font-bold">
                      {item.count > 0 ? `${item.count} Staf ` : ""}({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percent}%`,
                        backgroundColor: idx === 0 ? "#4731B6" : idx === 1 ? "#8D7BE4" : idx === 2 ? "#0E6100" : "#7E7E7E",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">Belum ada data distribusi divisi pada database.</p>
            )}
          </div>

          <div className="p-3 bg-[#F2F1F9] rounded-xl flex items-center justify-between text-xs">
            <span className="text-[#5F5F5F]">Status Kepegawaian:</span>
            <span className="font-bold text-[#4731B6]">
              {statusKepegawaian.tetap} Pegawai Tetap · {statusKepegawaian.kontrak} PKWT / Kontrak
            </span>
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
              <p className="text-xs text-[#7E7E7E]">Rata-rata kehadiran: <strong>{metrics.tingkatKehadiranHariIni}%</strong> per shift</p>
            </div>
            <Link href="/hrd/absensi" className="text-xs font-semibold text-[#4731B6] hover:underline">
              Rekap Lengkap
            </Link>
          </div>

          {/* Bar Chart */}
          <div className="pt-3 flex items-end justify-between gap-2 h-40 border-b border-gray-100 pb-2">
            {weeklyAttendance.length > 0 ? (
              weeklyAttendance.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-[#4731B6] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.percent}%
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${item.active
                        ? "bg-[#4731B6] shadow-md shadow-[#4731B6]/30"
                        : "bg-[#8D7BE4] hover:bg-[#4731B6]"
                      }`}
                    style={{ height: `${Math.max(15, item.percent - 20)}%` }}
                  />
                  <span className={`text-xs font-semibold ${item.active ? "text-[#4731B6] font-bold" : "text-[#7E7E7E]"}`}>
                    {item.day}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full flex items-center justify-center h-full text-xs text-gray-400">
                Belum ada data kehadiran mingguan pada database.
              </div>
            )}
          </div>

          {/* Shift Monitoring Row */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="block text-xs font-bold text-[#4731B6]">{shiftMonitoring.pagi} Staf</span>
              <span className="text-[10px] text-[#7E7E7E]">Shift Pagi</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="block text-xs font-bold text-[#3B289E]">{shiftMonitoring.siang} Staf</span>
              <span className="text-[10px] text-[#7E7E7E]">Shift Siang</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="block text-xs font-bold text-[#0E6100]">{shiftMonitoring.malam} Staf</span>
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
            <p className="text-[11px] text-[#7E7E7E] truncate">Kelola data {metrics.totalPegawaiAktif} pegawai</p>
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
            <p className="text-[11px] text-[#7E7E7E] truncate">{metrics.pendingBandingCount} berkas menunggu</p>
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
            <p className="text-[11px] text-[#7E7E7E] truncate">{metrics.totalPedomanCount} skema upah terbit</p>
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
          {recentActivities.length > 0 ? (
            recentActivities.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="min-w-0">
                  <h5 className="font-semibold text-xs sm:text-sm text-[#202020] truncate">
                    {item.title}
                  </h5>
                  <p className="text-[11px] sm:text-xs text-[#7E7E7E] mt-1">{item.subtitle}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-gray-400">
              Belum ada aktivitas atau log pengajuan pada database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
