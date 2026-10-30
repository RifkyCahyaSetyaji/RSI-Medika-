"use client";

import React, { useState, useEffect } from "react";
import {
  Fingerprint,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  FilePlus,
  X,
  Upload,
  AlertCircle,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { cn } from "@/shared/lib/utils";

interface AbsensiRecord {
  id: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar: string;
  durasi: string;
  status: string;
}

export default function AbsensiPage() {
  const [currentTime, setCurrentTime] = useState<string>("06:58:12");
  const [hasClockedIn, setHasClockedIn] = useState<boolean>(false);
  const [hasClockedOut, setHasClockedOut] = useState<boolean>(false);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Live digital clock simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [records, setRecords] = useState<AbsensiRecord[]>([
    {
      id: "1",
      tanggal: "Sen, 12 Mei 2025",
      jamMasuk: "06.59",
      jamKeluar: "14.02",
      durasi: "7 jam 3 menit",
      status: "Hadir",
    },
    {
      id: "2",
      tanggal: "Jum, 9 Mei 2025",
      jamMasuk: "06.59",
      jamKeluar: "14.02",
      durasi: "7 jam 3 menit",
      status: "Hadir",
    },
    {
      id: "3",
      tanggal: "Kam, 8 Mei 2025",
      jamMasuk: "06.59",
      jamKeluar: "-",
      durasi: "-",
      status: "Belum Absensi Pulang",
    },
    {
      id: "4",
      tanggal: "Rab, 7 Mei 2025",
      jamMasuk: "-",
      jamKeluar: "-",
      durasi: "-",
      status: "Tidak Hadir",
    },
  ]);

  // Leave form state
  const [leaveType, setLeaveType] = useState("Cuti Tahunan");
  const [startDate, setStartDate] = useState("2025-05-18");
  const [endDate, setEndDate] = useState("2025-05-20");
  const [leaveReason, setLeaveReason] = useState("");

  const handleClockIn = () => {
    setHasClockedIn(true);
    setSuccessMessage("Absen masuk berhasil dicatat!");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  const handleClockOut = () => {
    setHasClockedOut(true);
    setSuccessMessage("Absen pulang berhasil dicatat. Selamat beristirahat!");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLeaveModal(false);
    setSuccessMessage("Pengajuan Cuti / Izin berhasil dikirimkan!");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#202020] tracking-tight">
          Absensi
        </h2>
        <p className="text-sm text-[#5F5F5F]">
          Lakukan absensi masuk dan keluar serta lihat riwayat kehadiran Anda.
        </p>
      </div>

      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setShowSuccessToast(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Section: Clock/Action Card + Shift Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Digital Clock + Absen Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-[28px] p-8 shadow-xs border border-black/5 text-center space-y-6">
            <span className="text-xs font-semibold text-[#7E7E7E]">
              Senin, 12 Mei 2025
            </span>

            {/* Big Digital Clock */}
            <div className="font-mono text-5xl sm:text-6xl font-extrabold text-[#202020] tracking-wider py-1">
              {currentTime}
            </div>

            {/* Fingerprint info pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#F2F1F9] text-xs font-medium text-[#4731B6] max-w-sm">
              <Fingerprint className="w-4 h-4 shrink-0" />
              <span>Absensi dapat dilakukan melalui mesin fingerprint rumah sakit</span>
            </div>

            {/* 2 Buttons: Masuk & Keluar */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleClockIn}
                disabled={hasClockedIn}
                className={cn(
                  "w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xs transition-all cursor-pointer",
                  hasClockedIn
                    ? "bg-[#D8F0D3] text-[#0E6100] cursor-not-allowed"
                    : "bg-[#9A2500] hover:bg-[#801F00] text-white"
                )}
              >
                {hasClockedIn ? "✓ Sudah Absen Masuk (07.02 WIB)" : "Belum Absen Masuk"}
              </button>

              <button
                type="button"
                onClick={handleClockOut}
                disabled={!hasClockedIn || hasClockedOut}
                className={cn(
                  "w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xs transition-all",
                  hasClockedOut
                    ? "bg-[#D8F0D3] text-[#0E6100]"
                    : hasClockedIn
                    ? "bg-[#4731B6] hover:bg-[#3B289E] text-white cursor-pointer"
                    : "bg-[#D8D8D8] text-[#7E7E7E] cursor-not-allowed"
                )}
              >
                {hasClockedOut ? "✓ Sudah Absen Keluar (14.05 WIB)" : "Absen Keluar"}
              </button>
            </div>
          </div>

          {/* Ajukan Cuti/Izin button */}
          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="w-full py-4 px-6 rounded-2xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <FilePlus className="w-4 h-4" />
            <span>Ajukan Cuti/Izin</span>
          </button>
        </div>

        {/* Right Column: Informasi Jadwal Hari Ini */}
        <div className="lg:col-span-6 bg-white rounded-[28px] p-8 shadow-xs border border-black/5 space-y-6">
          <h3 className="font-bold text-base text-[#202020]">
            Informasi Jadwal Hari Ini
          </h3>

          {/* Shift badge box */}
          <div className="bg-[#F2F0FD] rounded-2xl p-4 flex items-center gap-3.5 border border-[#C4BAF5]/40">
            <div className="w-10 h-10 rounded-xl bg-[#4731B6] text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#202020]">Shift Pagi</h4>
              <p className="text-xs text-[#5F5F5F] mt-0.5">07.00–14.00 WIB</p>
            </div>
          </div>

          {/* Spec details table */}
          <div className="space-y-3.5 text-xs divide-y divide-gray-100 pt-1">
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Tanggal</span>
              <span className="font-medium text-[#202020]">Senin, 12 Mei 2025</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Jenis shift</span>
              <span className="font-medium text-[#202020]">Shift Pagi</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Jam</span>
              <span className="font-medium text-[#202020]">07.00–14.00</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Unit</span>
              <span className="font-medium text-[#202020]">Rawat Inap</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Riwayat Absensi Table */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xs border border-black/5 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base sm:text-lg text-[#202020]">
            Riwayat Absensi
          </h3>
          <button
            type="button"
            onClick={() => alert("Mengunduh rekap riwayat kehadiran PDF...")}
            className="py-2.5 px-5 bg-[#4731B6] hover:bg-[#3B289E] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Recap Absensi
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-[#7E7E7E]">
                <th className="pb-3 px-3">Tanggal</th>
                <th className="pb-3 px-3">Jam Masuk</th>
                <th className="pb-3 px-3">Jam Keluar</th>
                <th className="pb-3 px-3">Durasi</th>
                <th className="pb-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-3 font-medium text-[#202020]">{r.tanggal}</td>
                  <td className="py-4 px-3 text-[#3F3F3F]">{r.jamMasuk}</td>
                  <td className="py-4 px-3 text-[#3F3F3F]">{r.jamKeluar}</td>
                  <td className="py-4 px-3 text-[#5F5F5F]">{r.durasi}</td>
                  <td className="py-4 px-3 text-right">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajukan Cuti/Izin (Figma #198:10898) */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#202020]">
                Pengajuan Cuti / Izin
              </h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">
                  Jenis Pengajuan
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Sisa kuota: 12 hari)</option>
                  <option value="Izin Sakit">Izin Sakit (Butuh surat dokter)</option>
                  <option value="Izin Keperluan Keluarga">Izin Keperluan Keluarga</option>
                  <option value="Cuti Melahirkan">Cuti Melahirkan / Bersalin</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#202020]">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#202020]">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">
                  Alasan Cuti / Keterangan
                </label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Jelaskan alasan pengajuan cuti secara rinci..."
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">
                  Berkas Pendukung (Opsional / Wajib jika Sakit)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-[#5F5F5F]">
                    Klik untuk unggah surat keterangan dokter atau berkas (PDF/JPG, maks 5MB)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Kirim Permohonan
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
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
