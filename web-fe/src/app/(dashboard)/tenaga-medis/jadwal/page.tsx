"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertCircle,
  X,
  Send,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ShiftData {
  day: number;
  shift: "Pagi" | "Siang" | "Malam";
  hours: string;
  unit: string;
  dateStr: string;
}

export default function JadwalPage() {
  const [selectedDay, setSelectedDay] = useState<number>(12);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showChangeModal, setShowChangeModal] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [requestedDate, setRequestedDate] = useState<string>("2025-05-13");
  const [requestedShift, setRequestedShift] = useState<string>("Siang");
  const [submittedAlert, setSubmittedAlert] = useState<boolean>(false);

  // Mock shifts mapped to days in Mei 2025
  const shiftMap: Record<number, ShiftData> = {
    1: { day: 1, shift: "Pagi", hours: "07.00–14.00 WIB", unit: "Rawat Inap", dateStr: "Kamis, 1 Mei 2025" },
    2: { day: 2, shift: "Malam", hours: "21.00–07.00 WIB", unit: "Rawat Inap", dateStr: "Jumat, 2 Mei 2025" },
    5: { day: 5, shift: "Pagi", hours: "07.00–14.00 WIB", unit: "Rawat Inap", dateStr: "Senin, 5 Mei 2025" },
    6: { day: 6, shift: "Siang", hours: "14.00–21.00 WIB", unit: "Rawat Inap", dateStr: "Selasa, 6 Mei 2025" },
    7: { day: 7, shift: "Pagi", hours: "07.00–14.00 WIB", unit: "Rawat Inap", dateStr: "Rabu, 7 Mei 2025" },
    8: { day: 8, shift: "Siang", hours: "14.00–21.00 WIB", unit: "Rawat Inap", dateStr: "Kamis, 8 Mei 2025" },
    9: { day: 9, shift: "Siang", hours: "14.00–21.00 WIB", unit: "Rawat Inap", dateStr: "Jumat, 9 Mei 2025" },
    10: { day: 10, shift: "Malam", hours: "21.00–07.00 WIB", unit: "Rawat Inap", dateStr: "Sabtu, 10 Mei 2025" },
    12: { day: 12, shift: "Pagi", hours: "07.00–14.00 WIB", unit: "Rawat Inap", dateStr: "Senin, 12 Mei 2025" },
    13: { day: 13, shift: "Siang", hours: "14.00–21.00 WIB", unit: "Rawat Inap", dateStr: "Selasa, 13 Mei 2025" },
    14: { day: 14, shift: "Siang", hours: "14.00–21.00 WIB", unit: "Rawat Inap", dateStr: "Rabu, 14 Mei 2025" },
    15: { day: 15, shift: "Pagi", hours: "07.00–14.00 WIB", unit: "Rawat Inap", dateStr: "Kamis, 15 Mei 2025" },
    16: { day: 16, shift: "Pagi", hours: "07.00–14.00 WIB", unit: "Rawat Inap", dateStr: "Jumat, 16 Mei 2025" },
    17: { day: 17, shift: "Malam", hours: "21.00–07.00 WIB", unit: "Rawat Inap", dateStr: "Sabtu, 17 Mei 2025" },
    20: { day: 20, shift: "Pagi", hours: "07.00–14.00 WIB", unit: "Rawat Inap", dateStr: "Selasa, 20 Mei 2025" },
    21: { day: 21, shift: "Siang", hours: "14.00–21.00 WIB", unit: "Rawat Inap", dateStr: "Rabu, 21 Mei 2025" },
    22: { day: 22, shift: "Pagi", hours: "07.00–14.00 WIB", unit: "Rawat Inap", dateStr: "Kamis, 22 Mei 2025" },
    23: { day: 23, shift: "Malam", hours: "21.00–07.00 WIB", unit: "Rawat Inap", dateStr: "Jumat, 23 Mei 2025" },
    26: { day: 26, shift: "Siang", hours: "14.00–21.00 WIB", unit: "Rawat Inap", dateStr: "Senin, 26 Mei 2025" },
    27: { day: 27, shift: "Pagi", hours: "07.00–14.00 WIB", unit: "Rawat Inap", dateStr: "Selasa, 27 Mei 2025" },
    28: { day: 28, shift: "Siang", hours: "14.00–21.00 WIB", unit: "Rawat Inap", dateStr: "Rabu, 28 Mei 2025" },
    29: { day: 29, shift: "Pagi", hours: "07.00–14.00 WIB", unit: "Rawat Inap", dateStr: "Kamis, 29 Mei 2025" },
    30: { day: 30, shift: "Malam", hours: "21.00–07.00 WIB", unit: "Rawat Inap", dateStr: "Jumat, 30 Mei 2025" },
  };

  const selectedShift = shiftMap[selectedDay] || {
    day: selectedDay,
    shift: "Pagi",
    hours: "07.00–14.00 WIB",
    unit: "Rawat Inap",
    dateStr: `Mei ${selectedDay}, 2025`,
  };

  // Calendar dates layout (May 2025 begins on Thursday = index 4)
  const prevMonthDays = [27, 28, 29, 30];
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const getShiftColor = (shiftType: "Pagi" | "Siang" | "Malam") => {
    switch (shiftType) {
      case "Pagi":
        return "bg-[#4731B6]";
      case "Siang":
        return "bg-[#D2C43B]";
      case "Malam":
        return "bg-[#0E6100]";
    }
  };

  const handleSubmitChange = (e: React.FormEvent) => {
    e.preventDefault();
    setShowChangeModal(false);
    setShowDetailModal(false);
    setSubmittedAlert(true);
    setTimeout(() => setSubmittedAlert(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#202020] tracking-tight">
          Jadwal Kerja
        </h2>
        <p className="text-sm text-[#5F5F5F]">
          Lihat dan kelola jadwal kerja Anda.
        </p>
      </div>

      {submittedAlert && (
        <div className="p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-sm flex items-center justify-between">
          <span>Pengajuan tukar / ubah jadwal berhasil dikirim ke Kepala Ruangan / Sekretaris Unit!</span>
          <button onClick={() => setSubmittedAlert(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Calendar + Detail Jadwal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Calendar (7 or 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[28px] p-6 sm:p-8 shadow-xs border border-black/5 space-y-6">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 text-[#3F3F3F] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-base sm:text-lg text-[#202020]">
              Mei 2025
            </h3>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 text-[#3F3F3F] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#7E7E7E] pb-2 border-b border-gray-100">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-4 gap-x-1 sm:gap-x-2 text-center text-sm">
            {/* Previous month greyed days */}
            {prevMonthDays.map((d) => (
              <div
                key={`prev-${d}`}
                className="py-2.5 text-[#9E9E9E] font-normal flex flex-col items-center justify-center select-none"
              >
                <span>{d}</span>
              </div>
            ))}

            {/* Current month days */}
            {currentMonthDays.map((d) => {
              const hasShift = shiftMap[d];
              const isSelected = selectedDay === d;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDay(d)}
                  className={cn(
                    "py-2 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer group",
                    isSelected
                      ? "bg-[#F2F1F9] font-bold text-[#4731B6] ring-2 ring-[#4731B6]"
                      : "hover:bg-gray-50 text-[#202020]"
                  )}
                >
                  <span className="text-sm">{d}</span>
                  {/* Shift indicator line pill */}
                  {hasShift ? (
                    <span
                      className={cn(
                        "w-4 h-1 rounded-full mt-1 transition-transform group-hover:scale-125",
                        getShiftColor(hasShift.shift)
                      )}
                    />
                  ) : (
                    <span className="w-4 h-1 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend bar */}
          <div className="pt-6 border-t border-gray-100 flex items-center gap-6 text-xs text-[#5F5F5F] px-2">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 rounded-full bg-[#4731B6]" />
              <span>Pagi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 rounded-full bg-[#D2C43B]" />
              <span>Siang</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 rounded-full bg-[#0E6100]" />
              <span>Malam</span>
            </div>
          </div>
        </div>

        {/* Right: Detail Jadwal (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-black/5 space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#202020]">Detail Jadwal</h3>
            <p className="text-xs text-[#7E7E7E]">{selectedShift.dateStr}</p>
          </div>

          {/* Shift badge box */}
          <div className="bg-[#F2F0FD] rounded-2xl p-4 flex items-center gap-3.5 border border-[#C4BAF5]/40">
            <div className="w-10 h-10 rounded-xl bg-[#4731B6] text-white flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#202020]">
                Shift {selectedShift.shift}
              </h4>
              <p className="text-xs text-[#5F5F5F] mt-0.5">{selectedShift.hours}</p>
            </div>
          </div>

          {/* Spec details table */}
          <div className="space-y-3 text-xs divide-y divide-gray-100 pt-1">
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Tanggal</span>
              <span className="font-medium text-[#202020]">{selectedShift.dateStr}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Jenis shift</span>
              <span className="font-medium text-[#202020]">Shift {selectedShift.shift}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Jam</span>
              <span className="font-medium text-[#202020]">{selectedShift.hours}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Unit</span>
              <span className="font-medium text-[#202020]">{selectedShift.unit}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 pt-2">
            <h5 className="font-semibold text-xs text-[#202020]">Catatan</h5>
            <ul className="text-xs text-[#7E7E7E] space-y-1 pl-1">
              <li>• Kenakan seragam dinas lengkap & ID card</li>
              <li>• Lakukan absensi fingerprint sesuai jam jadwal</li>
            </ul>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={() => setShowDetailModal(true)}
            className="w-full py-3 px-4 rounded-xl border border-[#4731B6] text-[#4731B6] hover:bg-[#F2F1F9] font-semibold text-sm transition-colors cursor-pointer text-center"
          >
            Lihat detail lengkap
          </button>
        </div>
      </div>

      {/* Modal Detail Jadwal (Figma #192:6495) */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#202020]">
                Detail Informasi Jadwal
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F2F0FD] p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#4731B6] text-white flex items-center justify-center">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-[#202020]">
                  Shift {selectedShift.shift} - {selectedShift.unit}
                </h4>
                <p className="text-xs text-[#5F5F5F]">{selectedShift.dateStr} · {selectedShift.hours}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-[#7E7E7E]">Nama Pegawai</span>
                <span className="font-semibold text-[#202020]">Ns. Ayu Lestari, S.Kep.</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-[#7E7E7E]">Penanggung Jawab</span>
                <span className="font-medium text-[#202020]">dr. Hendra Prasetya, Sp.PD</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-[#7E7E7E]">Batas Toleransi Keterlambatan</span>
                <span className="font-medium text-[#202020]">15 Menit</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  setShowChangeModal(true);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Ajukan Perubahan Jadwal
              </button>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajukan Perubahan Jadwal (Figma #192:6763) */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#202020]">
                Pengajuan Perubahan Jadwal
              </h3>
              <button
                onClick={() => setShowChangeModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitChange} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FEF8D3] border border-[#D2C43B]/30 text-xs text-[#8A7C00] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Perubahan jadwal kerja wajib diajukan minimal 2 hari sebelumnya dan menunggu persetujuan Sekretaris Unit.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">Jadwal Saat Ini</label>
                <div className="p-3 rounded-xl bg-gray-50 text-xs text-[#3F3F3F] border border-gray-200">
                  {selectedShift.dateStr} (Shift {selectedShift.shift})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#202020]">Tanggal Baru</label>
                  <input
                    type="date"
                    required
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#202020]">Shift Pengganti</label>
                  <select
                    value={requestedShift}
                    onChange={(e) => setRequestedShift(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  >
                    <option value="Pagi">Shift Pagi (07.00–14.00)</option>
                    <option value="Siang">Shift Siang (14.00–21.00)</option>
                    <option value="Malam">Shift Malam (21.00–07.00)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">Alasan Perubahan</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Menggantikan shift rekan atau keperluan keluarga mendesak..."
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pengajuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
