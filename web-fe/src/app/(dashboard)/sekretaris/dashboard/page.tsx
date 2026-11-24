"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  CheckSquare,
  Mail,
  ChevronRight,
  TrendingUp,
  Users,
  Bed,
  Clock,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { dashboardService } from "@/shared/services/api/dashboard.service";
import { SekretarisDashboardData } from "@/shared/types/api";

function getFormattedDate(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SekretarisDashboard() {
  const { user } = useAuth();
  const [todayFormatted] = useState<string>(getFormattedDate);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<SekretarisDashboardData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await dashboardService.getSekretarisDashboard();
        if (isMounted && res) {
          setData(res);
        }
      } catch (err) {
        console.error("Gagal memuat dashboard Sekretaris dari backend:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const unitKerja = data?.unitKerja || "-";

  const metrics = data?.metrics || {
    tenagaMedisUnit: 0,
    perawatCount: 0,
    dokterCount: 0,
    personelJagaHariIni: 0,
    shiftHariIni: { pagi: 0, siang: 0, malam: 0 },
    pendingSubmissionsCount: 0,
    kehadiranUnitBulanIni: 0,
  };

  const kapasitasBOR = data?.kapasitasBOR || {
    borPercent: 0,
    bedTerisi: 0,
    totalBed: 0,
    bedTersedia: 0,
    pasienBaru: 0,
  };

  const weeklyShiftCoverage = data?.weeklyShiftCoverage || [];
  const recentSubmissions = data?.recentSubmissions || [];

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
              Operasional {unitKerja} Stabil
            </span>
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#4731B6] font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Sinkron data...
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
            Selamat pagi, {user?.nama?.split(" ")[0] || "Rizky"}!
          </h2>
          <p className="text-xs sm:text-sm text-[#5F5F5F] leading-relaxed max-w-md pt-1">
            Pantau keterisian jadwal jaga, verifikasi permohonan absensi perawat & dokter, serta koordinasi operasional {unitKerja} hari ini.
          </p>
        </div>
      </div>

      {/* 2. Sekretaris Stat Cards (4 Main Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Tenaga Medis Aktif */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Tenaga Medis Unit</span>
            <Users className="w-4 h-4 text-[#4731B6]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#4731B6] tracking-tight">
              {metrics.tenagaMedisUnit} Staf
            </div>
            <p className="text-[11px] text-[#5F5F5F] font-medium mt-0.5">
              {metrics.perawatCount} Perawat · {metrics.dokterCount} Dokter
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#4731B6] h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </div>

        {/* Metric 2: Personel Bertugas Hari Ini */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Personel Jaga Hari Ini</span>
            <Clock className="w-4 h-4 text-[#4731B6]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#202020] tracking-tight">
              {metrics.personelJagaHariIni} Personel
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Pagi: {metrics.shiftHariIni.pagi} · Siang: {metrics.shiftHariIni.siang} · Malam: {metrics.shiftHariIni.malam}
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0E6100] h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </div>

        {/* Metric 3: Pengajuan Menunggu */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Pengajuan Menunggu</span>
            <AlertCircle className="w-4 h-4 text-[#F39C12]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F39C12] tracking-tight">
              {metrics.pendingSubmissionsCount} Pengajuan
            </div>
            <p className="text-[11px] text-[#7E7E7E] mt-0.5">
              Tukar shift, cuti & koreksi presensi
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F39C12] h-full rounded-full" style={{ width: `${Math.min(metrics.pendingSubmissionsCount * 15, 100)}%` }} />
          </div>
        </div>

        {/* Metric 4: Kehadiran Unit */}
        <div className="bg-white rounded-[22px] p-5 shadow-xs border border-black/5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-[#7E7E7E]">
            <span className="text-xs font-semibold">Kehadiran Unit Bulan Ini</span>
            <ShieldCheck className="w-4 h-4 text-[#0E6100]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0E6100] tracking-tight">
              {metrics.kehadiranUnitBulanIni}%
            </div>
            <p className="text-[11px] text-[#0E6100] font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Di atas target standar (&gt;95%)
            </p>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0E6100] h-full rounded-full" style={{ width: `${Math.min(metrics.kehadiranUnitBulanIni, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* 3. Visual Statistik: Kapasitas Pasien & Jadwal Keterisian Shift */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Bed Occupancy & Rasio Layanan (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-black/5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-base text-[#202020] flex items-center gap-2">
                <Bed className="w-4 h-4 text-[#4731B6]" />
                <span>Kapasitas Pasien & Rasio Jaga (BOR)</span>
              </h3>
              <p className="text-xs text-[#7E7E7E]">{unitKerja} RSI Medika Hospital</p>
            </div>
            <span className="text-xs font-bold text-[#4731B6] bg-[#F2F1F9] px-2.5 py-1 rounded-lg">
              BOR: {kapasitasBOR.borPercent}%
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">
                  Keterisian Tempat Tidur ({kapasitasBOR.bedTerisi} / {kapasitasBOR.totalBed} Bed)
                </span>
                <span className="text-[#4731B6] font-bold">{kapasitasBOR.borPercent}% (Ideal 60–85%)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#4731B6] h-full rounded-full" style={{ width: `${kapasitasBOR.borPercent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-[#202020] font-semibold">Rasio Perawat : Pasien Shift Pagi</span>
                <span className="text-[#0E6100] font-bold">1 : 4.2 (Sesuai SPM)</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#0E6100] h-full rounded-full" style={{ width: "95%" }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] text-[#7E7E7E] block">Bed Tersedia</span>
              <span className="text-base font-bold text-[#0E6100]">{kapasitasBOR.bedTersedia} Tempat Tidur Siap</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[11px] text-[#7E7E7E] block">Pasien Masuk Hari Ini</span>
              <span className="text-base font-bold text-[#4731B6]">{kapasitasBOR.pasienBaru} Pasien Baru</span>
            </div>
          </div>
        </div>

        {/* Right: Roster Keterisian Shift Mingguan (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-black/5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm sm:text-base text-[#202020] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4731B6]" />
                <span>Statistik Cakupan Shift Mingguan</span>
              </h3>
              <p className="text-xs text-[#7E7E7E]">Keterisian jadwal: <strong>98.5%</strong> terpenuhi</p>
            </div>
            <Link href="/sekretaris/jadwal" className="text-xs font-semibold text-[#4731B6] hover:underline">
              Kelola Roster
            </Link>
          </div>

          {/* Bar Chart Keterisian */}
          <div className="pt-3 flex items-end justify-between gap-2 h-40 border-b border-gray-100 pb-2">
            {weeklyShiftCoverage.length > 0 ? (
              weeklyShiftCoverage.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-[#4731B6] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.coverage}%
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${item.active
                        ? "bg-[#4731B6] shadow-md shadow-[#4731B6]/30"
                        : "bg-[#8D7BE4] hover:bg-[#4731B6]"
                      }`}
                    style={{ height: `${Math.max(20, item.coverage - 20)}%` }}
                  />
                  <span className={`text-xs font-semibold ${item.active ? "text-[#4731B6] font-bold" : "text-[#7E7E7E]"}`}>
                    {item.day}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full flex items-center justify-center h-full text-xs text-gray-400">
                Belum ada data cakupan shift mingguan pada database.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#5F5F5F] pt-1">
            <span>Kebutuhan harian: {metrics.personelJagaHariIni} personel jaga</span>
            <span className="font-semibold text-[#0E6100]">Seluruh shift terpenuhi lengkap</span>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/sekretaris/jadwal"
          className="bg-white rounded-2xl p-5 shadow-xs border border-black/5 flex items-center gap-4 hover:border-[#4731B6] transition-colors group"
        >
          <div className="p-3 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
              Kelola Jadwal Unit
            </h4>
            <p className="text-xs text-[#7E7E7E] truncate">Atur roster shift & rotasi jaga</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
        </Link>

        <Link
          href="/sekretaris/absensi"
          className="bg-white rounded-2xl p-5 shadow-xs border border-black/5 flex items-center gap-4 hover:border-[#4731B6] transition-colors group"
        >
          <div className="p-3 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
              Pengajuan Absensi
            </h4>
            <p className="text-xs text-[#7E7E7E] truncate">{metrics.pendingSubmissionsCount} berkas permohonan izin/cuti</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
        </Link>

        <Link
          href="/sekretaris/gaji"
          className="bg-white rounded-2xl p-5 shadow-xs border border-black/5 flex items-center gap-4 hover:border-[#4731B6] transition-colors group"
        >
          <div className="p-3 rounded-xl bg-[#EBE9F8] text-[#4731B6] shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors truncate">
              Gaji & Remunerasi
            </h4>
            <p className="text-xs text-[#7E7E7E] truncate">Lihat slip & riwayat gaji</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#4731B6] shrink-0" />
        </Link>
      </div>

      {/* 5. Aktivitas Terbaru */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-[#202020]">Pengajuan Absensi Terkini di Unit</h3>
          <Link href="/sekretaris/absensi" className="text-xs font-semibold text-[#4731B6] hover:underline">
            Tinjau semua ({metrics.pendingSubmissionsCount})
          </Link>
        </div>

        <div className="bg-white rounded-[24px] shadow-xs border border-black/5 divide-y divide-gray-100 overflow-hidden">
          {recentSubmissions.length > 0 ? (
            recentSubmissions.map((item, idx) => (
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
              Belum ada permohonan absensi staf pada database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
