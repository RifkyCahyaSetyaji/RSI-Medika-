"use client";

import React, { useState } from "react";
import { Search, ChevronDown, Download, CheckCircle2, X } from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";

interface AbsensiMonitorItem {
  nip: string;
  pegawai: string;
  kehadiran: string;
  terlambat: string;
  status: string;
}

export default function RekapAbsensiPage() {
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState("Mei 2025");
  const [showToast, setShowToast] = useState(false);

  const [items] = useState<AbsensiMonitorItem[]>([
    {
      nip: "198904122014022001",
      pegawai: "Ayu Lestari",
      kehadiran: "18 hadir",
      terlambat: "2 terlambat",
      status: "Hadir",
    },
    {
      nip: "198811032013011002",
      pegawai: "Bima Pratama",
      kehadiran: "20 hadir",
      terlambat: "0 terlambat",
      status: "Hadir",
    },
    {
      nip: "199205142018022004",
      pegawai: "Rani Oktavia",
      kehadiran: "17 hadir",
      terlambat: "1 terlambat",
      status: "Izin",
    },
    {
      nip: "198706232012011003",
      pegawai: "Dedi Kurnia",
      kehadiran: "16 hadir",
      terlambat: "0 terlambat",
      status: "Sakit",
    },
  ]);

  const handleDownload = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const filtered = items.filter(
    (i) =>
      i.pegawai.toLowerCase().includes(search.toLowerCase()) ||
      i.nip.includes(search)
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
          Absensi
        </h2>
        <p className="text-xs sm:text-sm text-[#5F5F5F]">
          Kelola data dan status absensi seluruh pegawai rumah sakit.
        </p>
      </div>

      {showToast && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-xs sm:text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Rekapitulasi kehadiran pegawai periode {periode} berhasil diekspor ke Excel / PDF!</span>
          </div>
          <button onClick={() => setShowToast(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-1 max-w-2xl">
          {/* Search Field */}
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Pencarian</span>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari NIP atau nama pegawai..."
                className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#202020] outline-none"
              />
            </div>
          </div>

          {/* Filter Periode */}
          <div className="w-full sm:w-44 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Filter periode</span>
            <div className="relative">
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full appearance-none bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-[#202020] outline-none cursor-pointer"
              >
                <option value="Mei 2025">Mei 2025</option>
                <option value="April 2025">April 2025</option>
                <option value="Oktober 2026">Oktober 2026</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Unduh Rekap Button */}
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full sm:w-auto py-2.5 px-5 sm:px-6 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Unduh rekap</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-xs border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[620px] sm:min-w-full">
            <thead>
              <tr className="bg-[#4731B6] text-white text-xs font-semibold tracking-wider">
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">NIP</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Pegawai</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Kehadiran</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Terlambat</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {filtered.map((item) => (
                <tr key={item.nip} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-mono text-[#5F5F5F] whitespace-nowrap">{item.nip}</td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-bold text-[#202020] whitespace-nowrap">{item.pegawai}</td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-[#3F3F3F] whitespace-nowrap">{item.kehadiran}</td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-[#9A2500] font-medium whitespace-nowrap">{item.terlambat}</td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => alert(`Rincian absensi ${item.pegawai}`)}
                      className="text-xs font-semibold text-[#4731B6] hover:underline cursor-pointer"
                    >
                      Kelola
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs sm:text-sm text-[#7E7E7E]">
                    Tidak ada data absensi pegawai yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
