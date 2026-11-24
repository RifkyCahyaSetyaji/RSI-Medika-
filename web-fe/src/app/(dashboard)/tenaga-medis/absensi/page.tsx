"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Fingerprint,
  Calendar,
  CheckCircle2,
  FilePlus,
  X,
  Upload,
  AlertCircle,
  Loader2,
  Download,
  Clock,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { Pagination } from "@/shared/components/ui/pagination";
import { cn } from "@/shared/lib/utils";
import { absensiService } from "@/shared/services/api/absensi.service";
import { cutiService } from "@/shared/services/api/cuti.service";
import { izinService } from "@/shared/services/api/izin.service";
import { AbsensiItem, AbsensiStatusResponse } from "@/shared/types/api";

interface AbsensiRecord {
  id: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar: string;
  durasi: string;
  status: string;
}

const extractTime = (str?: string | null): string => {
  if (!str || typeof str !== "string") return "";
  if (str.length >= 16 && (str.includes("T") || str.includes(" "))) {
    return str.slice(11, 16);
  }
  return str.slice(0, 5);
};

const formatShiftRange = (jadwal?: any): string => {
  if (!jadwal) return "Batas toleransi kehadiran: 15 menit sebelum shift dimulai";
  const startRaw = jadwal.jamMulai || jadwal.mulai;
  const endRaw = jadwal.jamSelesai || jadwal.selesai;
  if (!startRaw || !endRaw) return "Batas toleransi kehadiran: 15 menit sebelum shift dimulai";
  const start = extractTime(startRaw).replace(":", ".");
  const end = extractTime(endRaw).replace(":", ".");
  return `${start} – ${end} WIB`;
};

export default function AbsensiPage() {
  const [currentTime, setCurrentTime] = useState<string>("07:00:00");
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>("Senin, 12 November 2026");
  const [hasClockedIn, setHasClockedIn] = useState<boolean>(false);
  const [hasClockedOut, setHasClockedOut] = useState<boolean>(false);
  const [clockInTime, setClockInTime] = useState<string>("");
  const [clockOutTime, setClockOutTime] = useState<string>("");
  const [statusInfo, setStatusInfo] = useState<AbsensiStatusResponse | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [records, setRecords] = useState<AbsensiRecord[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Leave form state
  const [leaveType, setLeaveType] = useState("Cuti Tahunan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  // Live digital clock simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${h}:${m}:${s}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      setCurrentDateFormatted(now.toLocaleDateString("id-ID", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAbsensiData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // 1. Ambil status absensi hari ini
      const statusRes = await absensiService.getStatus();
      setStatusInfo(statusRes);

      // Cek apakah ada absensi yang sedang berjalan
      if (statusRes.absensiBerjalan && statusRes.absensiBerjalan.length > 0) {
        const currentAbsen = statusRes.absensiBerjalan[0];
        if (currentAbsen.waktuMasuk) {
          setHasClockedIn(true);
          const timeStr = currentAbsen.jamMasuk || extractTime(currentAbsen.waktuMasuk);
          setClockInTime(`${timeStr.replace(":", ".")} WIB`);
        }
        if (currentAbsen.waktuPulang) {
          setHasClockedOut(true);
          const timeStr = currentAbsen.jamKeluar || extractTime(currentAbsen.waktuPulang);
          setClockOutTime(`${timeStr.replace(":", ".")} WIB`);
        }
      }

      // 2. Ambil riwayat absensi
      const riwayatRes = await absensiService.riwayatSaya({ limit: 10 });
      if (riwayatRes && riwayatRes.length > 0) {
        // Cek apakah ada record absensi hari ini di riwayat jika absensiBerjalan kosong
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];

        const todayRecord = riwayatRes.find((r) => r.tanggal?.startsWith(todayStr)) || riwayatRes[0];
        if (todayRecord && todayRecord.tanggal?.startsWith(todayStr)) {
          if (todayRecord.waktuMasuk) {
            setHasClockedIn(true);
            const timeStr = todayRecord.jamMasuk || extractTime(todayRecord.waktuMasuk);
            setClockInTime(`${timeStr.replace(":", ".")} WIB`);
          }
          if (todayRecord.waktuPulang) {
            setHasClockedOut(true);
            const timeStr = todayRecord.jamKeluar || extractTime(todayRecord.waktuPulang);
            setClockOutTime(`${timeStr.replace(":", ".")} WIB`);
          }
        }

        const mappedRecords: AbsensiRecord[] = riwayatRes.map((r: AbsensiItem, idx: number) => {
          let tglStr = r.tanggal || "-";
          if (r.tanggal) {
            const parts = r.tanggal.split("-");
            if (parts.length === 3) {
              const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              tglStr = d.toLocaleDateString("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            }
          }

          const masukStr = r.jamMasuk || (r.waktuMasuk ? extractTime(r.waktuMasuk) : "-");
          const keluarStr = r.jamKeluar || (r.waktuPulang ? extractTime(r.waktuPulang) : "-");
          const durasiStr = r.durasi || "-";

          return {
            id: r.idAbsensi || `jdw-${r.idJadwal || idx}`,
            tanggal: tglStr,
            jamMasuk: masukStr,
            jamKeluar: keluarStr,
            durasi: durasiStr,
            status: r.status || r.statusKehadiran || "Hadir",
          };
        });
        setRecords(mappedRecords);
      } else {
        setRecords([]);
      }
    } catch {
      setRecords([]);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAbsensiData();
  }, [loadAbsensiData]);

  const handleClockIn = async () => {
    setIsLoadingAction(true);
    setToastError(null);
    try {
      await absensiService.absenMasuk();
      setHasClockedIn(true);
      const now = new Date();
      setClockInTime(
        `${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")} WIB`
      );
      setSuccessMessage("Absen masuk berhasil dicatat ke sistem!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
      loadAbsensiData();
    } catch (err: any) {
      setToastError(err?.message || "Gagal melakukan absen masuk.");
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleClockOut = async () => {
    setIsLoadingAction(true);
    setToastError(null);
    try {
      await absensiService.absenPulang();
      setHasClockedOut(true);
      const now = new Date();
      setClockOutTime(
        `${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")} WIB`
      );
      setSuccessMessage("Absen pulang berhasil dicatat. Selamat beristirahat!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
      loadAbsensiData();
    } catch (err: any) {
      setToastError(err?.message || "Gagal melakukan absen pulang.");
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (endDate < startDate) {
      setToastError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    const isSakit = leaveType.toLowerCase().includes("sakit");
    if (isSakit && !attachedFile) {
      setToastError("Pengajuan Izin Sakit wajib melampirkan berkas pendukung (surat keterangan dokter).");
      return;
    }

    setIsLoadingAction(true);
    setToastError(null);
    try {
      if (leaveType.toLowerCase().includes("cuti")) {
        await cutiService.ajukanCuti({
          tanggalMulai: startDate,
          tanggalSelesai: endDate,
          jenisCuti: leaveType,
          alasan: leaveReason,
        });
      } else {
        const jenisClean = isSakit ? "Sakit" : "Izin";
        await izinService.ajukanIzin({
          tanggalMulai: startDate,
          tanggalSelesai: endDate,
          jenis: jenisClean,
          alasan: leaveReason,
          berkasPendukung: attachedFile ? attachedFile.name : undefined,
        });
      }
      setShowLeaveModal(false);
      setLeaveReason("");
      setAttachedFile(null);
      setSuccessMessage("Pengajuan Cuti / Izin berhasil dikirim ke sekretaris unit!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Pengajuan gagal dikirim.";
      setToastError(msg);
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Unduh riwayat absensi sebagai CSV
  const handleExportCSV = () => {
    if (records.length === 0) {
      setToastError("Tidak ada riwayat absensi untuk diunduh.");
      return;
    }

    const headers = ["Tanggal", "Jam Masuk", "Jam Keluar", "Durasi", "Status"];
    const rows = records.map((r) => [
      `"${r.tanggal}"`,
      `"${r.jamMasuk}"`,
      `"${r.jamKeluar}"`,
      `"${r.durasi}"`,
      `"${r.status}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `rekap-absensi-medika-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMessage("Rekap absensi berhasil diunduh dalam format CSV.");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  // Pagination calculations
  const totalPages = Math.ceil(records.length / itemsPerPage);
  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#202020] tracking-tight">
          Presensi & Absensi Pegawai
        </h2>
        <p className="text-xs sm:text-sm text-[#5F5F5F]">
          Lakukan pencatatan kehadiran mandiri, monitoring shift dinas, dan pengajuan izin kerja.
        </p>
      </div>

      {showSuccessToast && (
        <div className="p-3.5 sm:p-4 rounded-lg bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-[#0E6100]/80 hover:text-[#0E6100] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {toastError && (
        <div className="p-3.5 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span className="font-medium">{toastError}</span>
          </div>
          <button onClick={() => setToastError(null)} className="text-red-700/80 hover:text-red-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Section: Clock/Action Card + Shift Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Digital Clock + Absen Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl p-6 sm:p-7 shadow-xs border border-gray-200/90 text-center space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-semibold text-[#5F5F5F]">
                {currentDateFormatted}
              </span>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-[11px] font-medium text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Server Aktif (WIB)</span>
              </div>
            </div>

            {/* Big Digital Clock */}
            <div className="py-2">
              <div className="font-mono text-4xl sm:text-5xl font-bold text-[#202020] tracking-wider">
                {currentTime}
              </div>
              <p className="text-[11px] text-[#7E7E7E] mt-1">
                Waktu Indonesia Barat (UTC+7)
              </p>
            </div>

            {/* Status Kehadiran Hari Ini */}
            <div className="p-2.5 rounded-lg bg-[#F2F1F9] border border-[#C4BAF5]/40 flex items-center justify-center gap-2 text-xs text-[#4731B6]">
              <Fingerprint className="w-4 h-4 shrink-0" />
              <span className="font-medium">
                {hasClockedIn && hasClockedOut
                  ? "Status Hari Ini: Selesai Bertugas (Hadir)"
                  : hasClockedIn
                    ? "Status Hari Ini: Sedang Bertugas"
                    : "Status Hari Ini: Belum Melakukan Presensi"}
              </span>
            </div>

            {/* 2 Action Buttons: Masuk & Keluar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleClockIn}
                disabled={hasClockedIn || isLoadingAction}
                className={cn(
                  "w-full py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs",
                  hasClockedIn
                    ? "bg-[#D8F0D3] text-[#0E6100] border border-[#0E6100]/20 cursor-not-allowed"
                    : "bg-[#4731B6] hover:bg-[#3B289E] text-white cursor-pointer"
                )}
              >
                {isLoadingAction && !hasClockedIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasClockedIn ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#0E6100]" />
                    <span>Masuk: {clockInTime || "06.59 WIB"}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Absen Masuk</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClockOut}
                disabled={!hasClockedIn || hasClockedOut || isLoadingAction}
                className={cn(
                  "w-full py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs",
                  hasClockedOut
                    ? "bg-[#D8F0D3] text-[#0E6100] border border-[#0E6100]/20 cursor-not-allowed"
                    : hasClockedIn
                      ? "bg-[#9A2500] hover:bg-[#801F00] text-white cursor-pointer"
                      : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                )}
              >
                {isLoadingAction && hasClockedIn && !hasClockedOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasClockedOut ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#0E6100]" />
                    <span>Pulang: {clockOutTime || "14.02 WIB"}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Absen Keluar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ajukan Cuti/Izin button */}
          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="w-full py-3 px-4 rounded-lg bg-white border border-[#4731B6] text-[#4731B6] hover:bg-[#F2F1F9] font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <FilePlus className="w-4 h-4" />
            <span>Ajukan Permohonan Cuti / Izin</span>
          </button>
        </div>

        {/* Right Column: Informasi Jadwal Hari Ini */}
        <div className="lg:col-span-6 bg-white rounded-xl p-6 sm:p-7 shadow-xs border border-gray-200/90 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm sm:text-base text-[#202020]">
              Informasi Shift & Jadwal
            </h3>
            <span className="text-[11px] font-medium text-gray-500">
              Unit Rawat Inap
            </span>
          </div>

          {/* Shift badge box */}
          <div className="bg-[#F6F5FC] rounded-lg p-4 flex items-center gap-3.5 border border-[#C4BAF5]/40">
            <div className="w-10 h-10 rounded-lg bg-[#4731B6] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#202020]">
                {statusInfo?.jadwalAktif?.[0]?.jenisJadwal || "Shift Pagi (07.00 - 14.00 WIB)"}
              </h4>
              <p className="text-xs text-[#5F5F5F] mt-0.5">
                {formatShiftRange(statusInfo?.jadwalAktif?.[0])}
              </p>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2.5 text-xs divide-y divide-gray-100">
            <div className="flex justify-between py-1.5 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Tanggal Pelaksanaan</span>
              <span className="font-semibold text-[#202020]">{currentDateFormatted}</span>
            </div>
            <div className="flex justify-between py-1.5 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Jenis Shift</span>
              <span className="font-semibold text-[#4731B6]">
                {statusInfo?.jadwalAktif?.[0]?.jenisJadwal || "Shift Pagi Reguler"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Lokasi Penempatan</span>
              <span className="font-semibold text-[#202020]">Ruang Rawat Inap Lt. 2</span>
            </div>
            <div className="flex justify-between py-1.5 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Status Sinkronisasi</span>
              <span className="font-semibold text-emerald-700">Tersinkronisasi SIMRS Medika</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Riwayat Absensi Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/90 overflow-hidden space-y-0">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-sm sm:text-base text-[#202020]">
              Riwayat Kehadiran Terakhir
            </h3>
            {isLoadingData && <Loader2 className="w-4 h-4 animate-spin text-[#4731B6]" />}
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 py-2 px-3.5 bg-white hover:bg-gray-50 text-[#4731B6] border border-[#4731B6]/30 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Rekap CSV</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-[11px] sm:text-xs font-semibold text-[#5F5F5F]">
              <tr>
                <th className="py-3 px-4 sm:px-6">Tanggal</th>
                <th className="py-3 px-4 sm:px-6">Jam Masuk</th>
                <th className="py-3 px-4 sm:px-6">Jam Keluar</th>
                <th className="py-3 px-4 sm:px-6">Durasi Dinas</th>
                <th className="py-3 px-4 sm:px-6 text-right">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {paginatedRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-medium text-[#202020]">{r.tanggal}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-[#3F3F3F] font-mono">{r.jamMasuk}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-[#3F3F3F] font-mono">{r.jamKeluar}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-[#5F5F5F]">{r.durasi}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-500">
                    Belum ada catatan absensi tersimpan.
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
          totalItems={records.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Modal Ajukan Cuti/Izin */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl p-5 sm:p-7 shadow-xl border border-gray-200 space-y-5 relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                  Pengajuan Cuti / Izin Pegawai
                </h3>
                <p className="text-xs text-[#5F5F5F] mt-0.5">
                  Permohonan akan diverifikasi oleh Sekretaris Unit dan HRD.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {toastError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{toastError}</span>
                </div>
                <button type="button" onClick={() => setToastError(null)} className="cursor-pointer ml-2 text-red-600 hover:text-red-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">
                  Jenis Permohonan
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6]/20 focus:border-[#4731B6] outline-none bg-white"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Hak kuota reguler)</option>
                  <option value="Izin Sakit">Izin Sakit (Disertai surat dokter)</option>
                  <option value="Izin Keperluan Pribadi">Izin Keperluan Pribadi</option>
                  <option value="Cuti Melahirkan">Cuti Melahirkan / Bersalin</option>
                  <option value="Tukar Shift">Tukar Shift Jaga</option>
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
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6]/20 focus:border-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#202020]">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6]/20 focus:border-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">
                  Alasan / Keterangan Lengkap
                </label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Jelaskan alasan permohonan dengan jelas..."
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6]/20 focus:border-[#4731B6] outline-none resize-none"
                />
              </div>

              {/* File Attachment Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">
                  Berkas Pendukung (Opsional / Wajib jika Sakit)
                </label>
                {attachedFile ? (
                  <div className="p-3 border border-gray-200 rounded-lg flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2 text-xs text-[#202020] truncate">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">{attachedFile.name}</span>
                      <span className="text-[11px] text-gray-500 shrink-0">
                        ({(attachedFile.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="text-gray-400 hover:text-red-500 cursor-pointer ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-200 hover:border-[#4731B6]/50 rounded-lg p-4 text-center block hover:bg-gray-50/70 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachedFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-[#5F5F5F]">
                      Pilih berkas bukti (PDF/JPG, maks 5MB)
                    </p>
                  </label>
                )}
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isLoadingAction}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
                >
                  {isLoadingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Kirim Permohonan"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
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
