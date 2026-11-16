"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Download,
  CheckCircle2,
  X,
  Loader2,
  Users,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { Pagination } from "@/shared/components/ui/pagination";
import { absensiService } from "@/shared/services/api/absensi.service";
import { AbsensiItem } from "@/shared/types/api";

interface AbsensiMonitorItem {
  nip: string;
  pegawai: string;
  kehadiran: string;
  terlambat: string;
  status: string;
  jabatan?: string;
  unit?: string;
}

export default function RekapAbsensiPage() {
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState("Mei 2025");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedPegawai, setSelectedPegawai] = useState<AbsensiMonitorItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const defaultItems: AbsensiMonitorItem[] = [
    {
      nip: "198904122014022001",
      pegawai: "Ayu Lestari",
      kehadiran: "18 hadir",
      terlambat: "2 terlambat",
      status: "Hadir",
      jabatan: "Perawat Pelaksana",
      unit: "Unit Rawat Inap",
    },
    {
      nip: "198811032013011002",
      pegawai: "Bima Pratama",
      kehadiran: "20 hadir",
      terlambat: "0 terlambat",
      status: "Hadir",
      jabatan: "Perawat Pelaksana",
      unit: "Unit Gawat Darurat",
    },
    {
      nip: "199205142018022004",
      pegawai: "Rani Oktavia",
      kehadiran: "17 hadir",
      terlambat: "1 terlambat",
      status: "Izin",
      jabatan: "Perawat Ruang Inap 3A",
      unit: "Unit Rawat Inap",
    },
    {
      nip: "198706232012011003",
      pegawai: "Dedi Kurnia",
      kehadiran: "16 hadir",
      terlambat: "0 terlambat",
      status: "Sakit",
      jabatan: "Petugas Farmasi",
      unit: "Instalasi Farmasi",
    },
    {
      nip: "199402182019022005",
      pegawai: "Dewi Sartika",
      kehadiran: "19 hadir",
      terlambat: "1 terlambat",
      status: "Hadir",
      jabatan: "Perawat Kamar Operasi",
      unit: "Instalasi Bedah Sentral",
    },
    {
      nip: "198006122007011002",
      pegawai: "dr. Hendra Wijaya, Sp.A",
      kehadiran: "18 hadir",
      terlambat: "0 terlambat",
      status: "Hadir",
      jabatan: "Dokter Spesialis Anak",
      unit: "Poliklinik Anak",
    },
    {
      nip: "198203152009021003",
      pegawai: "dr. Farhan Alamsyah, Sp.PD",
      kehadiran: "17 hadir",
      terlambat: "0 terlambat",
      status: "Cuti",
      jabatan: "Dokter Spesialis Penyakit Dalam",
      unit: "Poliklinik Penyakit Dalam",
    },
    {
      nip: "199109092015022003",
      pegawai: "Siti Khotimah",
      kehadiran: "20 hadir",
      terlambat: "0 terlambat",
      status: "Hadir",
      jabatan: "Perawat Ruang ICU",
      unit: "Unit Perawatan Intensif",
    },
  ];

  const [items, setItems] = useState<AbsensiMonitorItem[]>(defaultItems);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadRekap() {
      setIsLoading(true);
      try {
        const data = await absensiService.rekapAbsensi();
        if (data && data.length > 0) {
          const mapped: AbsensiMonitorItem[] = data.map((a: AbsensiItem) => ({
            nip: a.pegawai?.nip || "-",
            pegawai: a.pegawai?.nama || "Pegawai",
            kehadiran: a.statusKehadiran,
            terlambat: a.waktuMasuk ? "Tepat Waktu" : "-",
            status: a.statusKehadiran.includes("Hadir") ? "Hadir" : "Tidak Hadir",
            jabatan: a.pegawai?.jabatan || "Tenaga Medis",
            unit: "Unit Rawat Inap",
          }));
          setItems(mapped);
        }
      } catch {
        // Fallback default
      } finally {
        setIsLoading(false);
      }
    }
    loadRekap();
  }, []);

  const handleDownloadCSV = () => {
    if (items.length === 0) return;

    const headers = ["NIP", "Nama Pegawai", "Kehadiran", "Keterlambatan", "Status", "Periode"];
    const rows = filtered.map((i) => [
      `"${i.nip}"`,
      `"${i.pegawai}"`,
      `"${i.kehadiran}"`,
      `"${i.terlambat}"`,
      `"${i.status}"`,
      `"${periode}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rekap-absensi-rsimedika-${periode.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`Rekapitulasi kehadiran pegawai periode ${periode} berhasil diunduh (CSV).`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const filtered = items.filter(
    (i) =>
      i.pegawai.toLowerCase().includes(search.toLowerCase()) ||
      i.nip.includes(search)
  );

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalHadir = items.filter((i) => i.status === "Hadir").length;
  const totalIzinSakit = items.filter((i) => i.status === "Izin" || i.status === "Sakit").length;

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#202020] tracking-tight">
            Rekapitulasi Absensi & Kehadiran Pegawai
          </h2>
          <p className="text-xs sm:text-sm text-[#5F5F5F]">
            Monitoring kedisiplinan kerja, rekapitulasi kehadiran berkala, dan evaluasi keterlambatan staf rumah sakit.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#4731B6] hover:bg-[#3B289E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Rekap (CSV)</span>
        </button>
      </div>

      {showToast && (
        <div className="p-3.5 sm:p-4 rounded-lg bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setShowToast(false)} className="text-[#0E6100]/80 hover:text-[#0E6100] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Pegawai Terpantau</span>
            <Users className="w-4 h-4 text-[#4731B6]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#202020]">{items.length}</p>
          <p className="text-[11px] text-[#7E7E7E]">Staf aktif tercatat</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Tingkat Kehadiran</span>
            <UserCheck className="w-4 h-4 text-[#0E6100]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#0E6100]">
            {items.length > 0 ? `${Math.round((totalHadir / items.length) * 100)}%` : "0%"}
          </p>
          <p className="text-[11px] text-[#7E7E7E]">{totalHadir} staf hadir penuh</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Izin & Sakit</span>
            <FileText className="w-4 h-4 text-[#F39C12]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#F39C12]">{totalIzinSakit}</p>
          <p className="text-[11px] text-[#7E7E7E]">Disertai bukti terverifikasi</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Catatan Terlambat</span>
            <Clock className="w-4 h-4 text-[#9A2500]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#9A2500]">3 Kasus</p>
          <p className="text-[11px] text-[#7E7E7E]">Periode {periode}</p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari NIP atau nama pegawai..."
              className="w-full bg-white border border-gray-300 focus:border-[#4731B6] focus:ring-2 focus:ring-[#4731B6]/20 rounded-lg py-2 pl-9 pr-4 text-xs sm:text-sm text-[#202020] outline-none"
            />
          </div>

          {/* Filter Periode */}
          <div className="w-full sm:w-48">
            <div className="relative">
              <select
                value={periode}
                onChange={(e) => {
                  setPeriode(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-white border border-gray-300 focus:border-[#4731B6] focus:ring-2 focus:ring-[#4731B6]/20 rounded-lg py-2 pl-3 pr-8 text-xs sm:text-sm text-[#202020] outline-none cursor-pointer font-medium"
              >
                <option value="Mei 2025">Periode: Mei 2025</option>
                <option value="April 2025">Periode: April 2025</option>
                <option value="Oktober 2026">Periode: Oktober 2026</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/90 overflow-hidden space-y-0">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4731B6]" />
            <h3 className="font-bold text-sm sm:text-base text-[#202020]">
              Data Kehadiran Pegawai ({filtered.length})
            </h3>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#4731B6]" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[620px] sm:min-w-full">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-[11px] sm:text-xs font-semibold text-[#5F5F5F]">
              <tr>
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">NIP</th>
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">Pegawai</th>
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">Kehadiran</th>
                <th className="py-3 px-4 sm:px-6 whitespace-nowrap">Keterlambatan</th>
                <th className="py-3 px-4 sm:px-6 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {paginatedItems.map((item) => (
                <tr key={item.nip} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-[#5F5F5F] whitespace-nowrap">{item.nip}</td>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#202020] whitespace-nowrap">
                    <div>
                      <span>{item.pegawai}</span>
                      {item.jabatan && (
                        <span className="block text-[11px] font-normal text-gray-500">{item.jabatan}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-[#3F3F3F] whitespace-nowrap">{item.kehadiran}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-[#9A2500] font-medium whitespace-nowrap font-mono">{item.terlambat}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedPegawai(item)}
                      className="px-2.5 py-1 rounded-md border border-gray-300 text-xs font-semibold text-[#4731B6] hover:bg-[#F2F1F9] transition-colors cursor-pointer"
                    >
                      Rincian
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

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Rincian Pegawai Modal */}
      {selectedPegawai && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-xl p-5 sm:p-6 shadow-xl border border-gray-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Rincian Absensi Pegawai
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPegawai(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <span className="text-[11px] text-[#7E7E7E]">Profil Pegawai</span>
                <p className="font-bold text-sm text-[#202020]">{selectedPegawai.pegawai}</p>
                <p className="text-xs text-[#5F5F5F]">NIP: {selectedPegawai.nip} · {selectedPegawai.jabatan || "Tenaga Medis"}</p>
                <p className="text-xs text-[#5F5F5F]">Penempatan: {selectedPegawai.unit || "Unit Rawat Inap"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                  <span className="text-[11px] text-[#7E7E7E]">Total Kehadiran</span>
                  <p className="font-bold text-[#0E6100] text-sm">{selectedPegawai.kehadiran}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                  <span className="text-[11px] text-[#7E7E7E]">Keterlambatan</span>
                  <p className="font-bold text-[#9A2500] text-sm">{selectedPegawai.terlambat}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <span className="text-[11px] text-[#7E7E7E]">Status Periode {periode}</span>
                <div className="pt-0.5">
                  <StatusBadge status={selectedPegawai.status} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setToastMessage(`Dispensasi absensi untuk ${selectedPegawai.pegawai} telah dicatat.`);
                  setShowToast(true);
                  setSelectedPegawai(null);
                  setTimeout(() => setShowToast(false), 3500);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Beri Dispensasi
              </button>
              <button
                type="button"
                onClick={() => setSelectedPegawai(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
