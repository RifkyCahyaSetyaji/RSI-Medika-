"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertCircle,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { jadwalService } from "@/shared/services/api/jadwal.service";
import { pengajuanJadwalService } from "@/shared/services/api/pengajuan-jadwal.service";
import { JadwalItem, PengajuanJadwalItem } from "@/shared/types/api";
import { FormPerubahanJamPraktikModal } from "@/shared/components/jadwal/form-perubahan-jam-praktik-modal";

interface ShiftData {
  idJadwal?: string;
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
  const [alertError, setAlertError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fallback shifts
  const defaultShiftMap: Record<number, ShiftData> = {
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

  const [shiftMap, setShiftMap] = useState<Record<number, ShiftData>>(defaultShiftMap);

  const loadJadwal = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await jadwalService.jadwalSaya();
      if (data && data.length > 0) {
        const newMap = { ...defaultShiftMap };
        data.forEach((j: JadwalItem) => {
          const d = new Date(j.tanggal);
          const dayNum = d.getDate();
          let shiftType: "Pagi" | "Siang" | "Malam" = "Pagi";
          if (j.jenisJadwal.toLowerCase().includes("malam")) shiftType = "Malam";
          else if (j.jenisJadwal.toLowerCase().includes("siang") || j.jenisJadwal.toLowerCase().includes("sore"))
            shiftType = "Siang";

          const jamMulai = j.jamMulai ? j.jamMulai.slice(11, 16) : "07.00";
          const jamSelesai = j.jamSelesai ? j.jamSelesai.slice(11, 16) : "14.00";

          newMap[dayNum] = {
            idJadwal: j.idJadwal,
            day: dayNum,
            shift: shiftType,
            hours: `${jamMulai}–${jamSelesai} WIB`,
            unit: j.pegawai?.unitKerja || "Rawat Inap",
            dateStr: d.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          };
        });
        setShiftMap(newMap);
      }
    } catch {
      // Pertahankan map bawaan jika offline
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJadwal();
  }, [loadJadwal]);

  const selectedShift = shiftMap[selectedDay] || {
    day: selectedDay,
    shift: "Pagi",
    hours: "07.00–14.00 WIB",
    unit: "Rawat Inap",
    dateStr: `Mei ${selectedDay}, 2025`,
  };

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

  const handleSubmitChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertError(null);
    try {
      await pengajuanJadwalService.ajukan({
        idJadwal: selectedShift.idJadwal || "JDW0000001",
        jenisPengajuan: "Perubahan Jadwal",
        tanggalBaru: requestedDate,
        alasan: reason || "Permohonan pergantian shift keperluan pribadi",
      });
      setShowChangeModal(false);
      setShowDetailModal(false);
      setSubmittedAlert(true);
      setTimeout(() => setSubmittedAlert(false), 4500);
    } catch (err: any) {
      setAlertError(err?.message || "Pengajuan perubahan jadwal gagal dikirim.");
      setShowChangeModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202020] tracking-tight">
              Jadwal Kerja & Jam Praktik
            </h2>
            {isLoading && <Loader2 className="w-5 h-5 animate-spin text-[#4731B6]" />}
          </div>
          <p className="text-xs sm:text-sm text-[#5F5F5F]">
            Lihat kalender dinas kerja, jadwal poliklinik, dan ajukan permohonan perubahan jam praktik dokter atau rotasi jaga.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowChangeModal(true)}
          className="py-2.5 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <Clock className="w-4 h-4" />
          <span>Form Perubahan Jam Praktik</span>
        </button>
      </div>

      {submittedAlert && (
        <div className="p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <span>✓ Pengajuan tukar / ubah jadwal berhasil dikirim ke database untuk diverifikasi Sekretaris Unit!</span>
          <button onClick={() => setSubmittedAlert(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {alertError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <span>{alertError}</span>
          <button onClick={() => setAlertError(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Calendar + Detail Jadwal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Calendar */}
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
            {prevMonthDays.map((d) => (
              <div
                key={`prev-${d}`}
                className="py-2.5 text-[#9E9E9E] font-normal flex flex-col items-center justify-center select-none"
              >
                <span>{d}</span>
              </div>
            ))}

            {currentMonthDays.map((d) => {
              const hasShift = shiftMap[d];
              const isSelected = selectedDay === d;

              return (
                <button
                  type="button"
                  key={`cur-${d}`}
                  onClick={() => {
                    setSelectedDay(d);
                    if (hasShift) setShowDetailModal(true);
                  }}
                  className={cn(
                    "py-2 px-1 rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer",
                    isSelected
                      ? "ring-2 ring-[#4731B6] bg-[#F2F0FD]"
                      : "hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "font-semibold text-xs sm:text-sm",
                      isSelected ? "text-[#4731B6] font-bold" : "text-[#202020]"
                    )}
                  >
                    {d}
                  </span>

                  {hasShift && (
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          getShiftColor(hasShift.shift)
                        )}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-6 text-xs text-[#5F5F5F]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4731B6]" />
              <span>Shift Pagi (07.00–14.00)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D2C43B]" />
              <span>Shift Siang (14.00–21.00)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0E6100]" />
              <span>Shift Malam (21.00–07.00)</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Shift Details card */}
        <div className="lg:col-span-4 bg-white rounded-[28px] p-6 sm:p-8 shadow-xs border border-black/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base sm:text-lg text-[#202020]">
              Detail Jadwal
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-[#5F5F5F]">
              Tanggal {selectedDay}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F2F0FD] border border-[#C4BAF5]/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4731B6]">
              <CalendarIcon className="w-4 h-4" />
              <span>{selectedShift.dateStr}</span>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-lg text-[#202020]">
                Shift {selectedShift.shift}
              </h4>
              <div className="flex items-center gap-2 text-xs text-[#5F5F5F]">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>{selectedShift.hours}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5F5F5F]">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>Unit: {selectedShift.unit}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowChangeModal(true)}
            className="w-full py-3.5 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Form Perubahan Jam Praktik / Shift</span>
          </button>
        </div>
      </div>

      {/* Modal Form Perubahan Jam Praktik & Shift */}
      {showChangeModal && (
        <FormPerubahanJamPraktikModal
          isOpen={showChangeModal}
          onClose={() => setShowChangeModal(false)}
          onSuccess={(msg) => {
            setSubmittedAlert(true);
            setTimeout(() => setSubmittedAlert(false), 5000);
          }}
          initialData={{
            idJadwal: selectedShift.idJadwal,
            tanggalStr: selectedShift.dateStr,
            jamStr: selectedShift.hours,
            jenisJadwal: selectedShift.shift,
            ruangan: selectedShift.unit,
          }}
        />
      )}
    </div>
  );
}
