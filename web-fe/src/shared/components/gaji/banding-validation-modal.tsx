"use client";

import React, { useState } from "react";
import {
  X,
  AlertCircle,
  User,
  DollarSign,
  ShieldCheck,
  Loader2,
  Calendar,
  Eye,
  Info,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { bandingGajiService } from "@/shared/services/api/banding-gaji.service";

export interface BandingValidationItem {
  id: string;
  pegawai: string;
  nip?: string;
  jabatan?: string;
  unit?: string;
  periode?: string;
  komponen: string;
  alasanLengkap?: string;
  nominal?: string;
  status: string;
  buktiPendukung?: string | null;
  keputusan?: string | null;
}

interface BandingValidationModalProps {
  item: BandingValidationItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: BandingValidationItem) => void;
  roleTitle?: string; // e.g. "HRD Rumah Sakit"
  readOnly?: boolean; // true untuk Manajemen Keuangan (hanya melihat)
}

export function BandingValidationModal({
  item,
  isOpen,
  onClose,
  onSuccess,
  roleTitle = "HRD Rumah Sakit",
  readOnly = false,
}: BandingValidationModalProps) {
  const [statusKeputusan, setStatusKeputusan] = useState<"Disetujui" | "Diproses" | "Ditolak">(
    (item.status === "Disetujui" || item.status === "Ditolak" || item.status === "Diproses"
      ? item.status
      : "Disetujui") as "Disetujui" | "Diproses" | "Ditolak"
  );
  const [jenisKoreksi, setJenisKoreksi] = useState<"tunjangan" | "potongan" | "none">("tunjangan");
  const [nominalKoreksi, setNominalKoreksi] = useState<string>(
    item.nominal ? item.nominal.replace(/[^0-9]/g, "") : "0"
  );
  const [catatanKeputusan, setCatatanKeputusan] = useState<string>(
    item.keputusan || ""
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    setIsLoading(true);
    setErrorMsg(null);

    const nominalNum = Number(nominalKoreksi) || 0;
    const payload: {
      status: "Disetujui" | "Diproses" | "Ditolak";
      keputusan?: string;
      selisihTunjangan?: number;
      selisihPotongan?: number;
    } = {
      status: statusKeputusan,
      keputusan: catatanKeputusan.slice(0, 20), // backend batasan 20 char untuk kolom keputusan
    };

    if (statusKeputusan === "Disetujui" && jenisKoreksi === "tunjangan") {
      payload.selisihTunjangan = nominalNum;
    } else if (statusKeputusan === "Disetujui" && jenisKoreksi === "potongan") {
      payload.selisihPotongan = -nominalNum;
    }

    try {
      await bandingGajiService.prosesBanding(item.id, payload);
      if (onSuccess) {
        onSuccess({
          ...item,
          status: statusKeputusan,
          keputusan: catatanKeputusan,
          nominal:
            nominalNum > 0
              ? new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(nominalNum)
              : item.nominal,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Gagal menyimpan keputusan validasi banding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 sm:space-y-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#202020] flex items-center gap-2">
              {readOnly ? (
                <>
                  <Eye className="w-5 h-5 text-[#4731B6]" />
                  <span>Detail Berkas Aju Banding</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-[#4731B6]" />
                  <span>Verifikasi & Keputusan Aju Banding</span>
                </>
              )}
            </h3>
            <p className="text-xs text-[#7E7E7E] mt-0.5">
              ID Berkas: <span className="font-mono font-semibold text-[#4731B6]">{item.id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Ringkasan Pengajuan Pegawai */}
        <div className="bg-[#F2F1F9] p-4 sm:p-5 rounded-2xl space-y-3 border border-[#C4BAF5]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8D4F0] pb-2.5">
            <div>
              <div className="font-bold text-sm sm:text-base text-[#202020] flex items-center gap-2">
                <User className="w-4 h-4 text-[#4731B6]" />
                <span>{item.pegawai}</span>
              </div>
              <div className="text-xs text-[#5F5F5F] mt-0.5">
                NIP: {item.nip || "198904122014022001"} · {item.jabatan || "Tenaga Medis"} · {item.unit || "Unit Rawat Inap"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5F5F5F]">Status Berkas:</span>
              <StatusBadge status={item.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#7E7E7E] block">Periode Gaji yang Dibanding:</span>
              <span className="font-semibold text-[#202020] flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#4731B6]" />
                <span>{item.periode || "November 2026"}</span>
              </span>
            </div>
            <div>
              <span className="text-[#7E7E7E] block">Klaim Nominal Selisih:</span>
              <span className="font-bold text-[#4731B6] text-sm mt-0.5 block">
                {item.nominal || "Rp 350.000"}
              </span>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-xs text-[#7E7E7E] block font-medium">Uraian / Alasan Banding dari Pegawai:</span>
            <div className="mt-1 p-2.5 bg-white rounded-xl text-xs text-[#202020] leading-relaxed border border-[#D8D4F0]">
              {item.alasanLengkap || item.komponen || "Pengajuan selisih tunjangan insentif jaga malam dan perhitungan potongan."}
            </div>
          </div>

          {item.buktiPendukung && (
            <div className="pt-1 text-xs">
              <span className="text-[#7E7E7E]">Lampiran / Bukti: </span>
              <span className="font-mono text-[#4731B6] underline cursor-pointer">{item.buktiPendukung}</span>
            </div>
          )}
        </div>

        {/* 2. Tampilan Read-Only untuk Keuangan atau Form Keputusan untuk HRD */}
        {readOnly ? (
          <div className="space-y-4 pt-1">
            {/* Informasi Otoritas Alur */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div className="leading-relaxed">
                <span className="font-bold block">Kewenangan Verifikasi: HRD & Personalia</span>
                Proses audit berkas, validasi keabsahan jadwal/absensi, serta pengesahan aju banding dilakukan sepenuhnya oleh tim **HRD**. Manajemen Keuangan memantau berkas ini untuk penyesuaian slip dan pembayaran gaji.
              </div>
            </div>

            {/* Riwayat Keputusan HRD */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#202020]">Status Saat Ini:</span>
                <StatusBadge status={item.status} />
              </div>
              <div className="space-y-1 pt-1">
                <span className="text-[#7E7E7E] block">Catatan Putusan / Tindak Lanjut HRD:</span>
                <p className="p-2.5 bg-white rounded-xl border border-gray-200 font-medium text-[#202020]">
                  {item.keputusan || (item.status === "Menunggu" ? "Belum diverifikasi oleh HRD (Menunggu antrean)." : "Tidak ada catatan keputusan.")}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          /* Form Verifikasi Interaktif Eksklusif HRD */
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Radio Status Baru */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#202020] flex items-center justify-between">
                <span>Hasil Verifikasi & Putusan HRD</span>
                <span className="text-[11px] font-normal text-[#4731B6] bg-[#F2F1F9] px-2 py-0.5 rounded-md border border-[#C4BAF5]/50">
                  Verifikator: {roleTitle}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatusKeputusan("Disetujui")}
                  className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${statusKeputusan === "Disetujui"
                      ? "bg-[#0E6100] text-white border-[#0E6100] shadow-xs"
                      : "bg-white text-[#3F3F3F] border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  ✓ Disetujui
                </button>
                <button
                  type="button"
                  onClick={() => setStatusKeputusan("Diproses")}
                  className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${statusKeputusan === "Diproses"
                      ? "bg-[#3B289E] text-white border-[#3B289E] shadow-xs"
                      : "bg-white text-[#3F3F3F] border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  ⟳ Diproses
                </button>
                <button
                  type="button"
                  onClick={() => setStatusKeputusan("Ditolak")}
                  className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${statusKeputusan === "Ditolak"
                      ? "bg-[#9A2500] text-white border-[#9A2500] shadow-xs"
                      : "bg-white text-[#3F3F3F] border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  ✕ Ditolak
                </button>
              </div>
            </div>

            {/* Opsi Koreksi Finansial (Hanya aktif jika Disetujui) */}
            {statusKeputusan === "Disetujui" && (
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="text-xs font-bold text-[#202020] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#0E6100]" />
                  <span>Penyesuaian Slip Gaji Periode Terkait</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#5F5F5F]">Bentuk Penyesuaian</label>
                    <select
                      value={jenisKoreksi}
                      onChange={(e: any) => setJenisKoreksi(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] bg-white outline-none focus:border-[#4731B6]"
                    >
                      <option value="tunjangan">Penambahan Tunjangan (+)</option>
                      <option value="potongan">Pengurangan Potongan (-)</option>
                      <option value="none">Tanpa Koreksi Nominal Langsung</option>
                    </select>
                  </div>

                  {jenisKoreksi !== "none" && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#5F5F5F]">
                        Nominal Koreksi (Rupiah)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={nominalKoreksi}
                        onChange={(e) => setNominalKoreksi(e.target.value)}
                        placeholder="Contoh: 350000"
                        className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold text-[#202020] bg-white outline-none focus:border-[#4731B6]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Catatan Keputusan / Pertimbangan */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#202020]">
                Catatan Verifikasi HRD & Alasan Putusan
              </label>
              <textarea
                rows={3}
                required
                value={catatanKeputusan}
                onChange={(e) => setCatatanKeputusan(e.target.value)}
                placeholder="Tuliskan catatan pemeriksaan berkas, data presensi, atau alasan penolakan..."
                className="w-full p-3 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Sahkan Verifikasi HRD</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
