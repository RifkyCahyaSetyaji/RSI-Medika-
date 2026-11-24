"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Eye, ShieldAlert, CheckCircle2, X } from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { Pagination } from "@/shared/components/ui/pagination";
import { bandingGajiService } from "@/shared/services/api/banding-gaji.service";
import { BandingGajiItem } from "@/shared/types/api";
import {
  BandingValidationModal,
  BandingValidationItem,
} from "@/shared/components/gaji/banding-validation-modal";

export default function KeuanganAjuBandingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedItem, setSelectedItem] = useState<BandingValidationItem | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const [bandingList, setBandingList] = useState<BandingValidationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadBanding() {
      setIsLoading(true);
      try {
        const data = await bandingGajiService.daftarBanding();
        if (data) {
          const mapped: BandingValidationItem[] = data.map((b: BandingGajiItem) => ({
            id: b.idPengajuan,
            pegawai: b.pegawai?.nama || "Pegawai Medika",
            nip: b.pegawai?.nip || "-",
            jabatan: b.pegawai?.jabatan || "Tenaga Medis",
            unit: b.pegawai?.unitKerja || "Unit Medika",
            periode: b.periodeGaji,
            komponen: b.alasanBanding.slice(0, 35),
            alasanLengkap: b.alasanBanding,
            nominal: b.penggajian?.tunjangan ? `Rp ${Number(b.penggajian.tunjangan).toLocaleString("id-ID")}` : "Penyesuaian",
            status: b.status,
            buktiPendukung: b.buktiPendukung,
            keputusan: b.keputusan,
          }));
          setBandingList(mapped);
        }
      } catch (err) {
        console.error("Gagal memuat daftar aju banding:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBanding();
  }, []);

  const filtered = bandingList.filter((b) => {
    const matchesSearch =
      b.pegawai.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.komponen.toLowerCase().includes(search.toLowerCase()) ||
      (b.nip && b.nip.includes(search));
    const matchesStatus =
      statusFilter === "Semua" || b.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
          Pemantauan Aju Banding Gaji
        </h2>
        <p className="text-xs sm:text-sm text-[#5F5F5F]">
          Monitoring status pengajuan banding gaji pegawai yang diverifikasi oleh HRD untuk sinkronisasi penyesuaian payroll.
        </p>
      </div>

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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari ID berkas, NIP, nama pegawai..."
                className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#202020] outline-none"
              />
            </div>
          </div>

          {/* Filter Status */}
          <div className="w-full sm:w-44 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Status Pengajuan</span>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-[#202020] outline-none cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Diproses">Diproses</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-center gap-2 bg-[#F2F1F9] px-4 py-2.5 rounded-2xl border border-[#C4BAF5]/40 text-xs text-[#4731B6] font-medium shrink-0">
          <ShieldAlert className="w-4 h-4 text-[#4731B6]" />
          <span>Verifikator: HRD (Hak Akses Keuangan: Hanya Pantau)</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/90 overflow-hidden space-y-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px] sm:min-w-full">
            <thead>
              <tr className="bg-[#4731B6] text-white text-xs font-semibold tracking-wider">
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">ID Berkas</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Pegawai</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Uraian Komponen</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Nominal Klaim</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Status Verifikasi</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {paginated.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-mono text-[#5F5F5F] whitespace-nowrap">
                    {b.id}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-bold text-[#202020] whitespace-nowrap">
                    <div>{b.pegawai}</div>
                    {b.unit && <div className="text-[11px] font-normal text-[#7E7E7E]">{b.unit}</div>}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-[#3F3F3F] max-w-xs truncate">
                    {b.komponen}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-semibold text-[#4731B6] whitespace-nowrap">
                    {b.nominal || "Rp 350.000"}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(b);
                        setShowValidationModal(true);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                      <span>Lihat Berkas</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs sm:text-sm text-[#7E7E7E]">
                    Tidak ada data pengajuan banding yang sesuai.
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

      {/* Modal Detail Aju Banding (Read-Only untuk Keuangan) */}
      {showValidationModal && selectedItem && (
        <BandingValidationModal
          item={selectedItem}
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          readOnly={true}
        />
      )}
    </div>
  );
}
