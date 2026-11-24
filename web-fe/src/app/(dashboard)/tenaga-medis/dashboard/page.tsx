"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { dashboardService } from "@/shared/services/api/dashboard.service";
import { TenagaMedisDashboardData } from "@/shared/types/api";

function getFormattedDate(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TenagaMedisDashboard() {
  const { user } = useAuth();
  const [todayFormatted] = useState<string>(getFormattedDate);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<TenagaMedisDashboardData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await dashboardService.getTenagaMedisDashboard();
        if (isMounted && res) {
          setData(res);
        }
      } catch (err) {
        console.error("Gagal memuat dashboard Tenaga Medis dari backend:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getDisplayName = (fullName?: string) => {
    if (!fullName) return "Pengguna";
    const parts = fullName.split(" ");
    if (parts[0].startsWith("Ns.") || parts[0].startsWith("dr.") || parts[0].startsWith("drg.")) {
      return parts[1] || parts[0];
    }
    return parts[0];
  };

  const displayName = getDisplayName(data?.pegawai?.nama || user?.nama);

  const todayShift = data?.todayShift || null;

  const metrics = data?.metrics || {
    tingkatKehadiran: 0,
    hadirCount: 0,
    mangkirCount: 0,
    jamKerjaBulanIni: 0,
    targetJamKerja: 0,
    jamLembur: 0,
    skorKedisiplinan: 0,
    gajiTerkini: "Rp 0",
    gajiPeriode: "-",
    statusGaji: "-",
    sisaCuti: 0,
  };

  const weeklyHours = data?.weeklyHours || [];

  const komposisiShift = data?.komposisiShiftBulanIni || {
    totalShift: 0,
    pagi: { count: 0, percent: 0 },
    siang: { count: 0, percent: 0 },
    malam: { count: 0, percent: 0 },
  };

  const recentLeaves = data?.recentLeaves || [];

  const totalHoursWeek = weeklyHours.reduce((acc, curr) => acc + (curr.hours || 0), 0);

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
            {todayShift ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D8F0D3] text-[#0E6100]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E6100] animate-pulse" />
                On Duty {todayShift.namaShift}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-[#7E7E7E]">
                Tidak ada jadwal dinas aktif
              </span>
            )}
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#4731B6] font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Sinkron data...
              </span>
            )}
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
              {metrics.tingkatKehadiran}%
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {metrics.hadirCount} Hadir · {metrics.mangkirCount} Mangkir
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#4731B6] h-full rounded-full" style={{ width: `${Math.min(metrics.tingkatKehadiran, 100)}%` }} />
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
              {metrics.jamKerjaBulanIni} <span className="text-xs font-normal text-[#7E7E7E]">/ {metrics.targetJamKerja} jam</span>
            </div>
            <p className="text-[11px] text-[#4731B6] font-medium mt-0.5">
              +{metrics.jamLembur} jam lembur terhitung
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0E6100] h-full rounded-full"
              style={{ width: `${Math.min((metrics.jamKerjaBulanIni / metrics.targetJamKerja) * 100, 100)}%` }}
            />
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
              {metrics.skorKedisiplinan} / 100
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-0.5">
              Rata-rata tiba tepat waktu
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0E6100] h-full rounded-full" style={{ width: `${Math.min(metrics.skorKedisiplinan, 100)}%` }} />
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
              {metrics.gajiTerkini}
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {metrics.gajiPeriode} ({metrics.statusGaji})
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
                Total minggu ini: <strong>{totalHoursWeek} Jam</strong> · Rata-rata: <strong>{(totalHoursWeek / 5).toFixed(1)} jam / hari kerja</strong>
              </p>
            </div>
            <span className="text-xs font-semibold text-[#4731B6] bg-[#F2F1F9] px-2.5 py-1 rounded-lg">
              Minggu Berjalan
            </span>
          </div>

          {/* Bar Chart Visualization */}
          {weeklyHours.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-[#7E7E7E] border-b border-gray-100">
              Belum ada riwayat jam kerja untuk minggu ini.
            </div>
          ) : (
            <div className="pt-4 flex items-end justify-between gap-2 sm:gap-4 h-40 border-b border-gray-100 pb-2">
              {weeklyHours.map((item, idx) => {
                const heightPercent = item.isOff ? 8 : (item.hours / 9) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-[#4731B6] opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.isOff ? "Libur" : `${item.hours}h`}
                    </span>
                    <div
                      className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${item.active
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
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 text-[#5F5F5F]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#4731B6]" />
              <span>Hari ini {todayShift ? `(${todayShift.namaShift})` : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#8D7BE4]" />
              <span>Shift Terjadwal</span>
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
            <p className="text-xs text-[#7E7E7E]">Total {komposisiShift.totalShift} shift dinas terjadwal</p>
          </div>

          {/* Shift Breakdown Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Shift Pagi (07.00 - 14.00)</span>
                <span className="text-[#4731B6] font-bold">
                  {komposisiShift.pagi.count} Shift ({komposisiShift.pagi.percent}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#4731B6] h-full rounded-full transition-all duration-500" style={{ width: `${komposisiShift.pagi.percent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Shift Siang (14.00 - 21.00)</span>
                <span className="text-[#3B289E] font-bold">
                  {komposisiShift.siang.count} Shift ({komposisiShift.siang.percent}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#3B289E] h-full rounded-full transition-all duration-500" style={{ width: `${komposisiShift.siang.percent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Shift Malam (21.00 - 07.00)</span>
                <span className="text-[#0E6100] font-bold">
                  {komposisiShift.malam.count} Shift ({komposisiShift.malam.percent}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0E6100] h-full rounded-full transition-all duration-500" style={{ width: `${komposisiShift.malam.percent}%` }} />
              </div>
            </div>
          </div>

          {/* Quick Leave Allowance Box */}
          <div className="p-3 bg-[#F2F1F9] rounded-xl flex items-center justify-between text-xs border border-[#C4BAF5]/40">
            <div>
              <span className="font-semibold text-[#202020] block">Sisa Hak Cuti Tahunan</span>
              <span className="text-[#7E7E7E] text-[11px]">Telah digunakan {Math.max(0, 12 - metrics.sisaCuti)} dari 12 hari</span>
            </div>
            <span className="font-extrabold text-sm text-[#4731B6] bg-white px-2.5 py-1 rounded-lg shadow-2xs">
              {metrics.sisaCuti} Hari Tersisa
            </span>
          </div>
        </div>
      </div>

      {/* 4. Jadwal Hari ini & Pengajuan Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Jadwal Hari Ini (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h3 className="text-sm sm:text-base font-bold text-[#202020]">Jadwal Hari ini</h3>

          {todayShift ? (
            <div className="bg-[#4731B6] rounded-[24px] p-6 text-white shadow-sm flex flex-col justify-between min-h-[240px]">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg sm:text-xl font-bold tracking-tight">{todayShift.namaShift}</h4>
                  <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {todayShift.ruangan}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-white/90">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-white/80 shrink-0" />
                    <span>{todayShift.jamMulai}–{todayShift.jamSelesai} WIB (Aktif)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-white/80 shrink-0" />
                    <span className="truncate">{todayShift.ruangan}</span>
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
          ) : (
            <div className="bg-white rounded-[24px] p-6 text-[#7E7E7E] border border-black/5 shadow-xs flex flex-col justify-center items-center text-center min-h-[240px] gap-3">
              <Calendar className="w-8 h-8 text-gray-300" />
              <p className="text-xs sm:text-sm font-medium">Tidak ada jadwal dinas aktif untuk hari ini.</p>
              <Link
                href="/tenaga-medis/jadwal"
                className="text-xs font-semibold text-[#4731B6] hover:underline"
              >
                Lihat Kalender Dinas
              </Link>
            </div>
          )}
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
            {recentLeaves.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7E7E7E]">
                Belum ada pengajuan cuti atau ketidakhadiran terbaru.
              </div>
            ) : (
              recentLeaves.map((item, idx) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
