"use client";

import React, { useState } from "react";
import { Search, Plus, X, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";

interface ScheduleItem {
  id: string;
  pegawai: string;
  nip: string;
  tanggal: string;
  shift: string;
  jam: string;
  unit: string;
  status: string;
}

export default function KelolaJadwalPage() {
  const [search, setSearch] = useState("");
  const [selectedShiftFilter, setSelectedShiftFilter] = useState("Semua");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Add form state
  const [pegawaiName, setPegawaiName] = useState("Ayu Lestari");
  const [scheduleDate, setScheduleDate] = useState("2025-05-15");
  const [scheduleShift, setScheduleShift] = useState("Pagi (07.00 - 14.00)");
  const [scheduleNotes, setScheduleNotes] = useState("");

  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: "1",
      pegawai: "Ayu Lestari",
      nip: "198904122014022001",
      tanggal: "Senin, 12 Mei 2025",
      shift: "Shift Pagi",
      jam: "07.00–14.00",
      unit: "Rawat Inap",
      status: "Disetujui",
    },
    {
      id: "2",
      pegawai: "Bima Pratama",
      nip: "198811032013011002",
      tanggal: "Senin, 12 Mei 2025",
      shift: "Shift Siang",
      jam: "14.00–21.00",
      unit: "Rawat Inap",
      status: "Disetujui",
    },
    {
      id: "3",
      pegawai: "Rani Oktavia",
      nip: "199205142018022004",
      tanggal: "Senin, 12 Mei 2025",
      shift: "Shift Malam",
      jam: "21.00–07.00",
      unit: "Rawat Inap",
      status: "Disetujui",
    },
    {
      id: "4",
      pegawai: "Dedi Kurnia",
      nip: "198706232012011003",
      tanggal: "Selasa, 13 Mei 2025",
      shift: "Shift Pagi",
      jam: "07.00–14.00",
      unit: "Rawat Inap",
      status: "Menunggu",
    },
  ]);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ScheduleItem = {
      id: String(Date.now()),
      pegawai: pegawaiName,
      nip: "198904122014022001",
      tanggal: scheduleDate,
      shift: scheduleShift.split(" ")[0],
      jam: scheduleShift.includes("Pagi")
        ? "07.00–14.00"
        : scheduleShift.includes("Siang")
        ? "14.00–21.00"
        : "21.00–07.00",
      unit: "Rawat Inap",
      status: "Disetujui",
    };
    setSchedules([newItem, ...schedules]);
    setShowAddModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const filtered = schedules.filter((s) => {
    const matchSearch =
      s.pegawai.toLowerCase().includes(search.toLowerCase()) ||
      s.nip.includes(search);
    const matchShift =
      selectedShiftFilter === "Semua" || s.shift.includes(selectedShiftFilter);
    return matchSearch && matchShift;
  });

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
            <span>Jadwal dinas baru berhasil diterbitkan dan dinotifikasikan ke pegawai!</span>
          </div>
          <button onClick={() => setShowToast(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-1 max-w-2xl">
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Pencarian tenaga medis</span>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau NIP..."
                className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#202020] outline-none"
              />
            </div>
          </div>

          <div className="w-full sm:w-44 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Filter shift</span>
            <select
              value={selectedShiftFilter}
              onChange={(e) => setSelectedShiftFilter(e.target.value)}
              className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-[#202020] outline-none cursor-pointer"
            >
              <option value="Semua">Semua Shift</option>
              <option value="Pagi">Shift Pagi</option>
              <option value="Siang">Shift Siang</option>
              <option value="Malam">Shift Malam</option>
            </select>
          </div>
        </div>

        <div className="w-full sm:w-auto">
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

      {/* Table */}
      <div className="bg-white rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-xs border border-black/5">
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
              {filtered.map((item) => (
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
                    <button
                      type="button"
                      onClick={() => alert(`Kelola jadwal ${item.pegawai}`)}
                      className="text-xs font-semibold text-[#4731B6] hover:underline cursor-pointer"
                    >
                      Ubah Jadwal
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs sm:text-sm text-[#7E7E7E]">
                    Tidak ada jadwal kerja yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                  value={pegawaiName}
                  onChange={(e) => setPegawaiName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                >
                  <option value="Ayu Lestari">Ayu Lestari - Perawat Pelaksana</option>
                  <option value="Bima Pratama">Bima Pratama - Dokter Umum</option>
                  <option value="Rani Oktavia">Rani Oktavia - Perawat ICU</option>
                  <option value="Dedi Kurnia">Dedi Kurnia - Perawat Rawat Jalan</option>
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
    </div>
  );
}
