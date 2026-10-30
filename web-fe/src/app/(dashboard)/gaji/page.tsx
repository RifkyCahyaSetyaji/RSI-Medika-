"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  AlertCircle,
  X,
  Send,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";

export default function GajiPage() {
  const [showAppealModal, setShowAppealModal] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [appealComponent, setAppealComponent] = useState("Tunjangan Peran / Shift Malam");
  const [appealAmount, setAppealAmount] = useState("350.000");
  const [appealReason, setAppealReason] = useState("");

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAppealModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleDownloadSlip = () => {
    alert("Slip Gaji periode Mei 2025 berhasil diunduh (PDF)!");
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
          Gaji
        </h2>
        <p className="text-xs sm:text-sm text-[#5F5F5F]">
          Lihat informasi gaji, slip gaji, dan riwayat pembayaran Anda.
        </p>
      </div>

      {showToast && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-xs sm:text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Pengajuan banding gaji berhasil dikirimkan ke HRD & Manajemen Keuangan!</span>
          </div>
          <button onClick={() => setShowToast(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top 2 Cards: Gaji Bersih & Ringkasan Gaji */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left: Gaji Bersih Card */}
        <div className="lg:col-span-5 bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 md:p-8 shadow-xs border border-black/5 flex flex-col justify-between space-y-5 sm:space-y-6">
          <div className="space-y-1.5 sm:space-y-2">
            <h3 className="font-bold text-xs sm:text-sm text-[#202020]">Gaji Bersih</h3>
            <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4731B6] tracking-tight pt-1 sm:pt-2">
              Rp 8.250.000
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAppealModal(true)}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Ajukan Banding</span>
          </button>
        </div>

        {/* Right: Ringkasan Gaji Card */}
        <div className="lg:col-span-7 bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 md:p-8 shadow-xs border border-black/5 flex flex-col justify-between space-y-5 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-[#4731B6] shrink-0" />
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-[#202020] truncate">
                  Ringkasan Gaji <span className="font-normal text-[#5F5F5F]">Mei 2025</span>
                </h3>
              </div>
              <StatusBadge status="Terbayar" />
            </div>

            <p className="text-[11px] sm:text-xs text-[#7E7E7E]">
              Tanggal pembayaran · 30 Mei 2025
            </p>

            {/* 3 Metric Columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <div className="min-w-0">
                <span className="block font-bold text-xs sm:text-sm md:text-base text-[#4731B6] truncate">
                  Rp 8.250.000
                </span>
                <span className="text-[10px] sm:text-xs text-[#7E7E7E] leading-tight block">
                  Total pendapatan
                </span>
              </div>
              <div className="min-w-0">
                <span className="block font-bold text-xs sm:text-sm md:text-base text-[#3F3F3F] truncate">
                  Rp 1.370.000
                </span>
                <span className="text-[10px] sm:text-xs text-[#7E7E7E] leading-tight block">
                  Total potongan
                </span>
              </div>
              <div className="min-w-0">
                <span className="block font-bold text-xs sm:text-sm md:text-base text-[#4731B6] truncate">
                  Rp 6.880.000
                </span>
                <span className="text-[10px] sm:text-xs text-[#7E7E7E] leading-tight block">
                  Jumlah diterima
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSlip}
            className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Lihat / Unduh Slip Gaji</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Rincian Komponen Gaji */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#202020]">
          Rincian Komponen Gaji
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card 1: Pendapatan */}
          <div className="bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 shadow-xs border border-black/5 flex flex-col justify-between space-y-5 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-bold text-xs sm:text-sm text-[#0E6100]">Pendapatan</h4>

              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm divide-y divide-gray-100">
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Gaji pokok</span>
                  <span className="font-semibold text-[#202020]">Rp 5.250.000</span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Tunjangan peran</span>
                  <span className="font-semibold text-[#202020]">Rp 1.250.000</span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Tugas tambahan</span>
                  <span className="font-semibold text-[#202020]">Rp 500.000</span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Potongan absensi</span>
                  <span className="font-semibold text-[#9A2500]">- Rp 120.000</span>
                </div>
              </div>
            </div>

            {/* Total Pendapatan Bar (Green) */}
            <div className="bg-[#D8F0D3] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-[#0E6100]">
              <span>Total Pendapatan</span>
              <span>Rp 8.250.000</span>
            </div>
          </div>

          {/* Card 2: Potongan */}
          <div className="bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 shadow-xs border border-black/5 flex flex-col justify-between space-y-5 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <h4 className="font-bold text-xs sm:text-sm text-[#9A2500]">Potongan</h4>

              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm divide-y divide-gray-100">
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>BPJS Kesehatan</span>
                  <span className="font-semibold text-[#202020]">Rp 300.000</span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>BPJS Ketenagakerjaan</span>
                  <span className="font-semibold text-[#202020]">Rp 200.000</span>
                </div>
                <div className="flex justify-between py-1.5 sm:py-2 text-[#3F3F3F]">
                  <span>Pajak PPh 21</span>
                  <span className="font-semibold text-[#202020]">Rp 750.000</span>
                </div>
              </div>
            </div>

            {/* Total Potongan Bar (Red/Pink) */}
            <div className="bg-[#FCDFD8] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-[#9A2500]">
              <span>Total Potongan</span>
              <span>Rp 1.370.000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ajukan Banding Gaji */}
      {showAppealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 sm:space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Pengajuan Banding Gaji
              </h3>
              <button
                type="button"
                onClick={() => setShowAppealModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAppeal} className="space-y-4">
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#D9E8FC] border border-[#003E9A]/20 text-xs text-[#003E9A] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Banding gaji akan diproses oleh HRD dan diteruskan ke Manajemen Keuangan dalam 3 hari kerja.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Komponen Gaji yang Disengketakan
                </label>
                <select
                  value={appealComponent}
                  onChange={(e) => setAppealComponent(e.target.value)}
                  className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none cursor-pointer"
                >
                  <option value="Tunjangan Peran / Shift Malam">Tunjangan Shift Malam (Kurang hitung)</option>
                  <option value="Uang Lembur">Uang Lembur (Jam belum sesuai)</option>
                  <option value="Potongan Absensi">Potongan Absensi (Presensi hadir tapi terpotong)</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Nominal Selisih yang Diajukan (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={appealAmount}
                  onChange={(e) => setAppealAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  placeholder="Contoh: 350.000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Alasan Banding & Bukti Terkait
                </label>
                <textarea
                  required
                  rows={3}
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Jelaskan secara mendalam tanggal shift / log kehadiran yang belum terhitung..."
                  className="w-full p-2.5 sm:p-3 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">
                  Lampiran Bukti (Opsional)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-[#7E7E7E]">
                    Unggah screenshot jadwal atau surat tugas (PDF/PNG)
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppealModal(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pengajuan Banding</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
