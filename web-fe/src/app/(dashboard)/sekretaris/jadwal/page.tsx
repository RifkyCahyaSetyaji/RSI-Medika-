"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, X, CheckCircle2, Loader2, Calendar, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { Pagination } from "@/shared/components/ui/pagination";
import { jadwalService } from "@/shared/services/api/jadwal.service";
import { hrdService } from "@/shared/services/api/hrd.service";
import { JadwalItem, Pegawai } from "@/shared/types/api";

interface ScheduleItem {
  id: string;
  pegawai: string;
  nip: string;
  tanggal: string;
  rawTanggal: string;
  shift: string;
  jam: string;
  unit: string;
  status: string;
}

export default function KelolaJadwalPage() {
  const [search, setSearch] = useState("");
  const [selectedShiftFilter, setSelectedShiftFilter] = useState("Semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Add form state
  const [selectedPegawaiId, setSelectedPegawaiId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleShift, setScheduleShift] = useState("Shift Pagi");
  const [scheduleNotes, setScheduleNotes] = useState("");

  // Edit form state
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [editShift, setEditShift] = useState("Shift Pagi");
  const [editDate, setEditDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setQuickDateRange = (type: "today" | "week" | "month") => {
    const now = new Date();
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (type === "today") {
      const todayStr = formatDate(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === "week") {
      const day = now.getDay();
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
      const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
      setStartDate(formatDate(monday));
      setEndDate(formatDate(sunday));
    } else if (type === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(lastDay));
    }
    setCurrentPage(1);
  };

  async function loadJadwal(dari?: string, sampai?: string) {
    setIsLoading(true);
    try {
      const params: any = {};
      if (dari) params.dari = dari;
      if (sampai) params.sampai = sampai;
      const data = await jadwalService.daftarJadwal(params);
      if (data && data.length > 0) {
        const mapped: ScheduleItem[] = data.map((j: JadwalItem) => {
          const d = new Date(j.tanggal);
          const rawTanggal = typeof j.tanggal === "string" ? j.tanggal.slice(0, 10) : "";
          const jamMulai = j.jamMulai
            ? j.jamMulai.length >= 16
              ? j.jamMulai.slice(11, 16)
              : j.jamMulai.slice(0, 5)
            : "07:00";
          const jamSelesai = j.jamSelesai
            ? j.jamSelesai.length >= 16
              ? j.jamSelesai.slice(11, 16)
              : j.jamSelesai.slice(0, 5)
            : "14:00";
          return {
            id: j.idJadwal,
            pegawai: j.pegawai?.nama || "Pegawai",
            nip: j.pegawai?.nip || "-",
            tanggal: d.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            rawTanggal,
            shift: j.jenisJadwal,
            jam: `${jamMulai}–${jamSelesai}`,
            unit: j.pegawai?.unitKerja || "Rawat Inap",
            status: "Disetujui",
          };
        });
        setSchedules(mapped);
      } else {
        setSchedules([]);
      }
    } catch {
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadJadwal(startDate, endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    hrdService.daftarPegawai().then((res) => {
      if (res && res.length > 0) {
        setPegawaiList(res);
        setSelectedPegawaiId(res[0].idPegawai);
      }
    }).catch(() => {});
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPegawaiId || !scheduleDate) return;

    try {
      const jamMulaiTime = scheduleShift.includes("Malam")
        ? "21:00:00"
        : scheduleShift.includes("Siang")
        ? "14:00:00"
        : "07:00:00";
      const jamSelesaiTime = scheduleShift.includes("Malam")
        ? "07:00:00"
        : scheduleShift.includes("Siang")
        ? "21:00:00"
        : "14:00:00";

      const shiftClean = scheduleShift.replace("Shift ", "").trim();
      await jadwalService.buatJadwal({
        idPegawai: selectedPegawaiId,
        tanggal: scheduleDate,
        shift: shiftClean,
        jenisJadwal: scheduleShift,
        jamMulai: `${scheduleDate}T${jamMulaiTime}Z`,
        jamSelesai: `${scheduleDate}T${jamSelesaiTime}Z`,
      } as any);
      await loadJadwal(startDate, endDate);
      setShowAddModal(false);
      setToastMessage("Jadwal dinas baru berhasil diterbitkan dan dinotifikasikan ke pegawai!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Gagal membuat jadwal");
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;
    setIsSubmitting(true);
    try {
      const shiftClean = editShift.replace("Shift ", "").trim();
      await jadwalService.ubahJadwal(editingSchedule.id, {
        ...(editDate ? { tanggal: editDate } : {}),
        shift: shiftClean,
        jenisJadwal: editShift,
      } as any);
      await loadJadwal(startDate, endDate);
      setShowEditModal(false);
      setEditingSchedule(null);
      setToastMessage("Jadwal dinas berhasil diperbarui di database!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Gagal mengubah jadwal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (id: string, name: string) => {
    if (!confirm(`Hapus jadwal kerja untuk ${name}?`)) return;
    try {
      await jadwalService.hapusJadwal(id);
      await loadJadwal(startDate, endDate);
      setToastMessage(`Jadwal kerja untuk ${name} berhasil dihapus.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Gagal menghapus jadwal");
    }
  };

  const filtered = schedules.filter((s) => {
    const matchSearch =
      s.pegawai.toLowerCase().includes(search.toLowerCase()) ||
      s.nip.includes(search);
    const matchShift =
      selectedShiftFilter === "Semua" || s.shift.includes(selectedShiftFilter);
    const matchDate =
      (!startDate || s.rawTanggal >= startDate) &&
      (!endDate || s.rawTanggal <= endDate);
    return matchSearch && matchShift && matchDate;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
          Kelola Jadwal Kerja
        </h2>
        <p className="text-xs sm:text-sm text-[#5F5F5F]">
          Atur pembagian shift tenaga medis pada unit kerja Anda.
        </p>
      </div>

      {showToast && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-xs sm:text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage || "Jadwal dinas baru berhasil diterbitkan dan dinotifikasikan ke pegawai!"}</span>
          </div>
          <button onClick={() => setShowToast(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
        {/* Row 1: Search, Shift, & Add Schedule Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-1">
            <div className="flex-1 space-y-1">
              <span className="text-xs font-semibold text-[#202020] block">Pencarian tenaga medis</span>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama atau NIP..."
                  className="w-full bg-[#FAFAFA] hover:bg-white border border-[#D8D8D8] focus:border-[#4731B6] focus:bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#202020] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="w-full sm:w-44 space-y-1">
              <span className="text-xs font-semibold text-[#202020] block">Filter shift</span>
              <select
                value={selectedShiftFilter}
                onChange={(e) => {
                  setSelectedShiftFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#FAFAFA] hover:bg-white border border-[#D8D8D8] focus:border-[#4731B6] focus:bg-white rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-[#202020] outline-none cursor-pointer transition-colors"
              >
                <option value="Semua">Semua Shift</option>
                <option value="Pagi">Shift Pagi</option>
                <option value="Siang">Shift Siang</option>
                <option value="Malam">Shift Malam</option>
              </select>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto py-2.5 px-5 sm:px-6 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal Kerja</span>
            </button>
          </div>
        </div>

        {/* Row 2: Date Range Filter */}
        <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row flex-wrap items-stretch md:items-end justify-between gap-3">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#202020] block">Dari Tanggal</span>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) {
                      setEndDate(e.target.value);
                    }
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-44 bg-[#FAFAFA] hover:bg-white border border-[#D8D8D8] focus:border-[#4731B6] focus:bg-white rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-[#202020] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#202020] block">Sampai Tanggal</span>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-44 bg-[#FAFAFA] hover:bg-white border border-[#D8D8D8] focus:border-[#4731B6] focus:bg-white rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-[#202020] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pb-0.5">
              <span className="text-xs text-gray-400 hidden sm:inline mr-1">Preset:</span>
              <button
                type="button"
                onClick={() => setQuickDateRange("today")}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#4731B6] hover:text-[#4731B6] text-xs font-medium text-[#5F5F5F] transition-colors cursor-pointer bg-white"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setQuickDateRange("week")}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#4731B6] hover:text-[#4731B6] text-xs font-medium text-[#5F5F5F] transition-colors cursor-pointer bg-white"
              >
                Minggu Ini
              </button>
              <button
                type="button"
                onClick={() => setQuickDateRange("month")}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-[#4731B6] hover:text-[#4731B6] text-xs font-medium text-[#5F5F5F] transition-colors cursor-pointer bg-white"
              >
                Bulan Ini
              </button>
            </div>
          </div>

          {(startDate || endDate || search || selectedShiftFilter !== "Semua") && (
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSearch("");
                setSelectedShiftFilter("Semua");
                setCurrentPage(1);
              }}
              className="py-2 px-3 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 self-start md:self-end"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Active Filter Info Badge */}
        {(startDate || endDate) && (
          <div className="flex items-center gap-2 pt-1 text-xs text-[#5F5F5F]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4F2FF] border border-[#4731B6]/20 text-[#4731B6] font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Filter tanggal aktif: {startDate || "Semua awal"} s/d {endDate || "Semua akhir"}
            </span>
            <span className="text-gray-400">({filtered.length} jadwal ditemukan)</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/90 overflow-hidden space-y-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[620px] sm:min-w-full">
            <thead>
              <tr className="bg-[#4731B6] text-white text-xs font-semibold tracking-wider">
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Tenaga Medis</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">NIP</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Tanggal Dinas</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Shift & Jam</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {paginated.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-bold text-[#202020] whitespace-nowrap">{item.pegawai}</td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-mono text-[#5F5F5F] whitespace-nowrap">{item.nip}</td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-[#3F3F3F] whitespace-nowrap">{item.tanggal}</td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">
                    <span className="font-semibold text-[#4731B6]">{item.shift}</span>
                    <span className="text-[#7E7E7E] text-xs block">{item.jam}</span>
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSchedule(item);
                          setEditShift(
                            item.shift.includes("Pagi")
                              ? "Shift Pagi"
                              : item.shift.includes("Siang")
                              ? "Shift Siang"
                              : "Shift Malam"
                          );
                          setEditDate("");
                          setShowEditModal(true);
                        }}
                        className="text-xs font-semibold text-[#4731B6] hover:underline cursor-pointer"
                      >
                        Ubah
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(item.id, item.pegawai)}
                        className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs sm:text-sm text-[#7E7E7E]">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-[#4731B6]" />
                        <span>Memuat data jadwal kerja...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <p className="font-medium text-[#3F3F3F]">Tidak ada jadwal kerja yang ditemukan</p>
                        <p className="text-xs text-[#7E7E7E]">
                          {startDate || endDate || search || selectedShiftFilter !== "Semua"
                            ? "Coba ubah rentang tanggal, shift, atau kata kunci pencarian Anda."
                            : "Belum ada jadwal kerja yang terdaftar di unit ini."}
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Modal Tambah Jadwal Kerja */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 sm:space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Tambah Jadwal Kerja Unit
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Pilih Tenaga Medis</label>
                <select
                  value={selectedPegawaiId}
                  onChange={(e) => setSelectedPegawaiId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                >
                  <option value="">-- Pilih Tenaga Medis --</option>
                  {pegawaiList.map((p) => (
                    <option key={p.idPegawai} value={p.idPegawai}>
                      {p.nama} {p.jabatan ? `- ${p.jabatan}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Tanggal Penugasan</label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Shift Kerja</label>
                  <select
                    value={scheduleShift}
                    onChange={(e) => setScheduleShift(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  >
                    <option value="Shift Pagi">Shift Pagi (07.00–14.00)</option>
                    <option value="Shift Siang">Shift Siang (14.00–21.00)</option>
                    <option value="Shift Malam">Shift Malam (21.00–07.00)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Catatan Tugas / Ruangan</label>
                <textarea
                  rows={2}
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="Contoh: Bertugas di Ruang Isolasi / Kamar 301-310..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Terbitkan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Jadwal Kerja */}
      {showEditModal && editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 sm:space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                  Ubah Jadwal Kerja
                </h3>
                <p className="text-xs text-[#7E7E7E] mt-0.5">
                  Tenaga Medis: <strong>{editingSchedule.pegawai}</strong> ({editingSchedule.nip})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSchedule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Tanggal Baru (kosongkan jika tidak diubah)
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                />
                <span className="text-[11px] text-gray-500">
                  Tanggal saat ini: {editingSchedule.tanggal}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Shift Kerja</label>
                <select
                  value={editShift}
                  onChange={(e) => setEditShift(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                >
                  <option value="Shift Pagi">Shift Pagi (07.00–14.00)</option>
                  <option value="Shift Siang">Shift Siang (14.00–21.00)</option>
                  <option value="Shift Malam">Shift Malam (21.00–07.00)</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
