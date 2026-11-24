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
  CheckSquare,
  Eye,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { Pagination } from "@/shared/components/ui/pagination";
import { absensiService } from "@/shared/services/api/absensi.service";
import { cutiService } from "@/shared/services/api/cuti.service";
import { izinService } from "@/shared/services/api/izin.service";
import { koreksiAbsensiService } from "@/shared/services/api/koreksi-absensi.service";
import { pengajuanJadwalService } from "@/shared/services/api/pengajuan-jadwal.service";
import { AbsensiItem } from "@/shared/types/api";

interface LeaveSubmission {
  id: string;
  tanggalPengajuan: string;
  pegawai: string;
  nip: string;
  jabatan: string;
  unit: string;
  jenis: "Izin Sakit" | "Cuti Tahunan" | "Tukar Shift" | "Koreksi Presensi";
  tanggalTarget: string;
  shiftTerkait?: string;
  alasan: string;
  lampiran?: string;
  status: "Diproses" | "Disetujui" | "Ditolak";
}

const normalizeSubmissionStatus = (status?: string): "Diproses" | "Disetujui" | "Ditolak" => {
  const s = (status || "").toUpperCase();
  if (s === "DISETUJUI") return "Disetujui";
  if (s === "DITOLAK") return "Ditolak";
  return "Diproses";
};

interface AbsensiMonitorItem {
  idPegawai: string;
  nip: string;
  pegawai: string;
  kehadiran: string;
  terlambat: string;
  lembur: string;
  alpha: string;
  sakitIzin: string;
  status: string;
  jabatan?: string;
  unit?: string;
  totalHadir: number;
  totalTerlambat: number;
  totalLembur: number;
  totalAlpha: number;
  totalSakit: number;
  totalIzin: number;
  totalCuti: number;
  shifts: AbsensiItem[];
}

export default function RekapAbsensiPage() {
  const [activeTab, setActiveTab] = useState<"rekap" | "pengajuan">("rekap");

  const [search, setSearch] = useState("");
  
  // Opsi pilihan periode (bulan ini dan 5 bulan sebelumnya)
  const periodeOptions = React.useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      list.push({ key, label });
    }
    return list;
  }, []);

  const [selectedPeriodeKey, setSelectedPeriodeKey] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const periode =
    periodeOptions.find((p) => p.key === selectedPeriodeKey)?.label ||
    new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedPegawai, setSelectedPegawai] = useState<AbsensiMonitorItem | null>(null);

  // Pagination state rekap
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const [items, setItems] = useState<AbsensiMonitorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State Submissions (Pengajuan Presensi & Izin RS)
  const [submissions, setSubmissions] = useState<LeaveSubmission[]>([]);
  const [isSubmissionsLoading, setIsSubmissionsLoading] = useState<boolean>(false);
  const [submissionSearch, setSubmissionSearch] = useState<string>("");
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>("Semua");
  const [submissionJenisFilter, setSubmissionJenisFilter] = useState<string>("Semua");
  const [selectedSubmission, setSelectedSubmission] = useState<LeaveSubmission | null>(null);
  const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState<boolean>(false);
  const [submissionCurrentPage, setSubmissionCurrentPage] = useState<number>(1);
  const [submissionItemsPerPage, setSubmissionItemsPerPage] = useState<number>(5);

  const [rejectTarget, setRejectTarget] = useState<LeaveSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  useEffect(() => {
    async function loadSubmissions() {
      setIsSubmissionsLoading(true);
      try {
        const [cutiRes, izinRes, koreksiRes, jadwalRes] = await Promise.all([
          cutiService.daftarCuti(),
          izinService.daftarIzin(),
          koreksiAbsensiService.daftarKoreksi().catch(() => []),
          pengajuanJadwalService.daftarPengajuan().catch(() => []),
        ]);
        const mapped: LeaveSubmission[] = [];
        if (cutiRes && cutiRes.length > 0) {
          cutiRes.forEach((c) => {
            const tgl = c.tanggalMulai ? new Date(c.tanggalMulai).toLocaleDateString("id-ID") : "-";
            mapped.push({
              id: c.idPengajuan,
              tanggalPengajuan: tgl,
              pegawai: c.pegawai?.nama || "Pegawai",
              nip: c.pegawai?.nip || "-",
              jabatan: c.pegawai?.jabatan || "Tenaga Medis",
              unit: c.pegawai?.unitKerja || "-",
              jenis: "Cuti Tahunan",
              tanggalTarget: `${c.tanggalMulai} s/d ${c.tanggalSelesai}`,
              alasan: c.alasan,
              status: normalizeSubmissionStatus(c.status),
            });
          });
        }
        if (izinRes && izinRes.length > 0) {
          izinRes.forEach((iz) => {
            const tgl = iz.tanggalMulai ? new Date(iz.tanggalMulai).toLocaleDateString("id-ID") : "-";
            mapped.push({
              id: iz.idPengajuan,
              tanggalPengajuan: tgl,
              pegawai: iz.pegawai?.nama || "Pegawai",
              nip: iz.pegawai?.nip || "-",
              jabatan: iz.pegawai?.jabatan || "Tenaga Medis",
              unit: iz.pegawai?.unitKerja || "-",
              jenis: "Izin Sakit",
              tanggalTarget: `${iz.tanggalMulai} s/d ${iz.tanggalSelesai}`,
              alasan: iz.alasan,
              status: normalizeSubmissionStatus(iz.status),
            });
          });
        }
        if (koreksiRes && koreksiRes.length > 0) {
          koreksiRes.forEach((k: any) => {
            const tglTgt = k.absensi?.tanggal || "-";
            const shiftName = k.absensi?.jadwal?.jenisJadwal || "Shift Jaga";
            mapped.push({
              id: k.idKoreksi,
              tanggalPengajuan: tglTgt,
              pegawai: k.pegawai?.nama || k.absensi?.pegawai?.nama || "Pegawai",
              nip: k.pegawai?.nip || k.absensi?.pegawai?.nip || "-",
              jabatan: k.pegawai?.jabatan || k.absensi?.pegawai?.jabatan || "Tenaga Medis",
              unit: k.pegawai?.unitKerja || k.absensi?.pegawai?.unitKerja || "-",
              jenis: "Koreksi Presensi",
              tanggalTarget: `${tglTgt} (${shiftName})`,
              shiftTerkait: shiftName,
              alasan: k.alasanKoreksi || "Koreksi jam absensi",
              status: normalizeSubmissionStatus(k.status),
            });
          });
        }
        if (jadwalRes && jadwalRes.length > 0) {
          jadwalRes.forEach((pj: any) => {
            const tgl = pj.tanggalBaru || (pj.jadwalLama ? pj.jadwalLama.tanggal : "-");
            const jamMulai = pj.jamMulaiBaru ? pj.jamMulaiBaru.slice(0, 5) : "";
            const jamSelesai = pj.jamSelesaiBaru ? pj.jamSelesaiBaru.slice(0, 5) : "";
            mapped.push({
              id: pj.idPengajuan,
              tanggalPengajuan: tgl,
              pegawai: pj.pegawai?.nama || "Pegawai",
              nip: pj.pegawai?.nip || "-",
              jabatan: pj.pegawai?.jabatan || "Tenaga Medis",
              unit: pj.pegawai?.unitKerja || "-",
              jenis: "Tukar Shift",
              tanggalTarget: `${tgl}${jamMulai ? ` (${jamMulai}–${jamSelesai})` : ""}`,
              shiftTerkait: pj.jenisPengajuan || "Tukar Shift",
              alasan: pj.alasan || "Permohonan tukar shift dinas",
              status: normalizeSubmissionStatus(pj.status),
            });
          });
        }
        setSubmissions(mapped);
      } catch {
        setSubmissions([]);
      } finally {
        setIsSubmissionsLoading(false);
      }
    }
    loadSubmissions();
  }, []);

  const handleApproveSubmission = async (id: string, name: string) => {
    setIsSubmittingAction(true);
    try {
      if (id.startsWith("CUTI")) {
        await cutiService.setujuiCuti(id);
      } else if (id.startsWith("IZIN") || id.startsWith("KTH")) {
        await izinService.setujuiIzin(id);
      } else if (id.startsWith("KOR")) {
        await koreksiAbsensiService.setujuiKoreksi(id);
      } else if (id.startsWith("PJAD")) {
        await pengajuanJadwalService.setujui(id);
      }
    } catch {
      // Local fallback
    } finally {
      setIsSubmittingAction(false);
    }
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: "Disetujui" as const } : sub))
    );
    setShowSubmissionDetailModal(false);
    setToastMessage(`Pengajuan absensi ${name} telah berhasil disetujui!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const openRejectSubmissionDialog = (sub: LeaveSubmission) => {
    setRejectTarget(sub);
    setRejectReason("");
  };

  const handleConfirmRejectSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;

    const note = rejectReason.trim() || "Tidak memenuhi kualifikasi/alasan belum lengkap";
    setIsSubmittingAction(true);
    try {
      if (rejectTarget.id.startsWith("CUTI")) {
        await cutiService.tolakCuti(rejectTarget.id, note);
      } else if (rejectTarget.id.startsWith("IZIN") || rejectTarget.id.startsWith("KTH")) {
        await izinService.tolakIzin(rejectTarget.id, note);
      } else if (rejectTarget.id.startsWith("KOR")) {
        await koreksiAbsensiService.tolakKoreksi(rejectTarget.id, note);
      } else if (rejectTarget.id.startsWith("PJAD")) {
        await pengajuanJadwalService.tolak(rejectTarget.id, note);
      }
    } catch {
      // Local fallback
    } finally {
      setIsSubmittingAction(false);
    }

    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === rejectTarget.id ? { ...sub, status: "Ditolak" as const } : sub))
    );
    setRejectTarget(null);
    setShowSubmissionDetailModal(false);
    setToastMessage(`Pengajuan absensi ${rejectTarget.pegawai} telah ditolak.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleExportSubmissionsCSV = () => {
    if (filteredSubmissions.length === 0) return;
    const headers = ["ID", "Pegawai", "NIP", "Jabatan", "Unit", "Jenis", "Tanggal Target", "Alasan", "Status"];
    const rows = filteredSubmissions.map((s) => [
      `"${s.id}"`,
      `"${s.pegawai}"`,
      `"${s.nip}"`,
      `"${s.jabatan}"`,
      `"${s.unit}"`,
      `"${s.jenis}"`,
      `"${s.tanggalTarget}"`,
      `"${s.alasan.replace(/"/g, '""')}"`,
      `"${s.status}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pengajuan-presensi-rsimedika-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Daftar permohonan presensi rumah sakit berhasil diekspor ke CSV.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.pegawai.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      sub.nip.includes(submissionSearch) ||
      sub.jenis.toLowerCase().includes(submissionSearch.toLowerCase());

    const matchesStatus =
      submissionStatusFilter === "Semua" ||
      (submissionStatusFilter === "Menunggu" && sub.status === "Diproses") ||
      (submissionStatusFilter === "Disetujui" && sub.status === "Disetujui") ||
      (submissionStatusFilter === "Ditolak" && sub.status === "Ditolak");

    const matchesJenis = submissionJenisFilter === "Semua" || sub.jenis === submissionJenisFilter;

    return matchesSearch && matchesStatus && matchesJenis;
  });

  const totalSubmissionsDiproses = submissions.filter((s) => s.status === "Diproses").length;
  const totalSubmissionsDisetujui = submissions.filter((s) => s.status === "Disetujui").length;
  const totalSubmissionsDitolak = submissions.filter((s) => s.status === "Ditolak").length;

  const totalSubmissionPages = Math.ceil(filteredSubmissions.length / submissionItemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (submissionCurrentPage - 1) * submissionItemsPerPage,
    submissionCurrentPage * submissionItemsPerPage
  );

  useEffect(() => {
    async function loadRekap() {
      setIsLoading(true);
      try {
        const data = await absensiService.rekapAbsensi({ periode: selectedPeriodeKey });
        if (data && data.length > 0) {
          // Kelompokkan data jadwal/absensi per pegawai agar sesuai dengan format rekapitulasi bulanan
          const grouped = new Map<string, {
            idPegawai: string;
            nip: string;
            pegawai: string;
            jabatan: string;
            unit: string;
            totalHadir: number;
            totalTerlambat: number;
            totalLembur: number;
            totalAlpha: number;
            totalSakit: number;
            totalIzin: number;
            totalCuti: number;
            shifts: AbsensiItem[];
          }>();

          data.forEach((a: AbsensiItem) => {
            const key = a.pegawai?.idPegawai || a.pegawai?.nip || a.idPegawai || "unknown";
            if (!grouped.has(key)) {
              grouped.set(key, {
                idPegawai: key,
                nip: a.pegawai?.nip || "-",
                pegawai: a.pegawai?.nama || "Pegawai",
                jabatan: a.pegawai?.jabatan || "-",
                unit: a.pegawai?.unitKerja || "-",
                totalHadir: 0,
                totalTerlambat: 0,
                totalLembur: 0,
                totalAlpha: 0,
                totalSakit: 0,
                totalIzin: 0,
                totalCuti: 0,
                shifts: [],
              });
            }

            const p = grouped.get(key)!;
            p.shifts.push(a);

            const st = (a.statusKehadiran || a.status || "").toLowerCase();
            const jns = (a.jadwal?.jenisJadwal || "").toLowerCase();
            const isLembur = Boolean(a.lembur) || Boolean(a.jadwal?.lembur) || jns.includes("lembur");

            const isHadir =
              st === "hadir" ||
              st === "hadir tepat waktu" ||
              st === "terlambat" ||
              Boolean(a.waktuMasuk);

            const isTerlambat =
              st === "terlambat" ||
              (a.menitTerlambat != null && a.menitTerlambat > 0);

            const isSakit = st === "sakit" || jns.includes("sakit");
            const isIzin = st === "izin" || jns.includes("izin");
            const isCuti = st === "cuti" || jns.includes("cuti");

            const isAlpha =
              st === "tidak hadir" ||
              st === "alpa" ||
              st === "alpha" ||
              (!a.waktuMasuk && !isSakit && !isIzin && !isCuti && st !== "akan datang" && st !== "belum absen");

            if (isLembur) p.totalLembur += 1;
            if (isHadir) p.totalHadir += 1;
            if (isTerlambat) p.totalTerlambat += 1;
            if (isAlpha) p.totalAlpha += 1;
            if (isSakit) p.totalSakit += 1;
            if (isIzin) p.totalIzin += 1;
            if (isCuti) p.totalCuti += 1;
          });

          const mapped: AbsensiMonitorItem[] = Array.from(grouped.values()).map((g) => {
            let status = "Hadir";
            if (g.totalHadir === 0) {
              if (g.totalCuti > 0) status = "Cuti";
              else if (g.totalSakit > 0) status = "Sakit";
              else if (g.totalIzin > 0) status = "Izin";
              else if (g.totalAlpha > 0) status = "Tidak Hadir";
              else status = "Tidak Hadir";
            } else if (g.totalAlpha > 0) {
              status = "Peringatan";
            }

            return {
              idPegawai: g.idPegawai,
              nip: g.nip,
              pegawai: g.pegawai,
              kehadiran: `${g.totalHadir} hadir`,
              terlambat: `${g.totalTerlambat} terlambat`,
              lembur: `${g.totalLembur}x lembur`,
              alpha: `${g.totalAlpha}x alpha`,
              sakitIzin: `${g.totalSakit}x sakit, ${g.totalIzin}x izin`,
              status,
              jabatan: g.jabatan,
              unit: g.unit,
              totalHadir: g.totalHadir,
              totalTerlambat: g.totalTerlambat,
              totalLembur: g.totalLembur,
              totalAlpha: g.totalAlpha,
              totalSakit: g.totalSakit,
              totalIzin: g.totalIzin,
              totalCuti: g.totalCuti,
              shifts: g.shifts,
            };
          });

          setItems(mapped);
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadRekap();
  }, [selectedPeriodeKey]);

  const handleDownloadCSV = () => {
    if (items.length === 0) return;

    const headers = [
      "NIP",
      "Nama Pegawai",
      "Jabatan",
      "Unit",
      "Total Hadir",
      "Terlambat",
      "Lembur",
      "Alpha",
      "Sakit",
      "Izin",
      "Cuti",
      "Status",
      "Periode",
    ];
    const rows = filtered.map((i) => [
      `"${i.nip}"`,
      `"${i.pegawai}"`,
      `"${i.jabatan || "-"}"`,
      `"${i.unit || "-"}"`,
      `"${i.totalHadir}"`,
      `"${i.totalTerlambat}"`,
      `"${i.totalLembur}"`,
      `"${i.totalAlpha}"`,
      `"${i.totalSakit}"`,
      `"${i.totalIzin}"`,
      `"${i.totalCuti}"`,
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

  const totalHadir = items.filter((i) => i.totalHadir > 0).length;
  const totalLemburKasus = items.reduce((acc, i) => acc + i.totalLembur, 0);
  const totalAlphaKasus = items.reduce((acc, i) => acc + i.totalAlpha, 0);
  const totalSakitKasus = items.reduce((acc, i) => acc + i.totalSakit, 0);
  const totalIzinKasus = items.reduce((acc, i) => acc + i.totalIzin, 0);
  const totalTerlambatKasus = items.reduce((acc, i) => acc + i.totalTerlambat, 0);

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#202020] tracking-tight">
            {activeTab === "rekap"
              ? "Rekapitulasi Absensi & Kehadiran Pegawai"
              : "Pengajuan Presensi & Izin Rumah Sakit"}
          </h2>
          <p className="text-xs sm:text-sm text-[#5F5F5F]">
            {activeTab === "rekap"
              ? "Monitoring kedisiplinan kerja, rekapitulasi kehadiran berkala, evaluasi lembur, alpha, sakit, dan izin staf rumah sakit."
              : "Verifikasi dan persetujuan permohonan izin sakit, cuti tahunan, tukar shift, dan koreksi absen seluruh staf rumah sakit."}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === "rekap" ? (
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#4731B6] hover:bg-[#3B289E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Rekap (CSV)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleExportSubmissionsCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Ekspor Pengajuan (CSV)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("rekap")}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-2 ${
            activeTab === "rekap"
              ? "text-[#4731B6] border-b-2 border-[#4731B6]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Rekapitulasi Absensi Pegawai</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
            {items.length} Pegawai
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pengajuan")}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-2 ${
            activeTab === "pengajuan"
              ? "text-[#4731B6] border-b-2 border-[#4731B6]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Pengajuan Presensi & Izin</span>
          {totalSubmissionsDiproses > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F39C12]/15 text-[#9A6200]">
              {totalSubmissionsDiproses}
            </span>
          )}
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

      {/* TAB 1: REKAPITULASI ABSENSI */}
      {activeTab === "rekap" && (
        <>
          {/* Summary KPI Cards: 6 Detail Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-200/90 space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Pegawai</span>
            <Users className="w-4 h-4 text-[#4731B6]" />
          </div>
          <p className="text-2xl font-bold text-[#202020]">{items.length}</p>
          <p className="text-[11px] text-[#7E7E7E]">Staf terpantau</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-200/90 space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Kehadiran</span>
            <UserCheck className="w-4 h-4 text-[#0E6100]" />
          </div>
          <p className="text-2xl font-bold text-[#0E6100]">
            {items.length > 0 ? `${Math.round((totalHadir / items.length) * 100)}%` : "0%"}
          </p>
          <p className="text-[11px] text-[#7E7E7E]">{totalHadir} staf hadir</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-200/90 space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Lembur</span>
            <Clock className="w-4 h-4 text-[#4731B6]" />
          </div>
          <p className="text-2xl font-bold text-[#4731B6]">{totalLemburKasus}x</p>
          <p className="text-[11px] text-[#7E7E7E]">Shift tambahan</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-200/90 space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Alpha</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className={`text-2xl font-bold ${totalAlphaKasus > 0 ? "text-red-600" : "text-[#202020]"}`}>
            {totalAlphaKasus}x
          </p>
          <p className="text-[11px] text-[#7E7E7E]">Tanpa keterangan</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-200/90 space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Sakit & Izin</span>
            <FileText className="w-4 h-4 text-[#F39C12]" />
          </div>
          <p className="text-2xl font-bold text-[#F39C12]">{totalSakitKasus + totalIzinKasus}x</p>
          <p className="text-[11px] text-[#7E7E7E]">{totalSakitKasus} Sakit · {totalIzinKasus} Izin</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-200/90 space-y-1">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium">Terlambat</span>
            <Clock className="w-4 h-4 text-[#9A2500]" />
          </div>
          <p className="text-2xl font-bold text-[#9A2500]">{totalTerlambatKasus}x</p>
          <p className="text-[11px] text-[#7E7E7E]">Keterlambatan</p>
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
                value={selectedPeriodeKey}
                onChange={(e) => {
                  setSelectedPeriodeKey(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-white border border-gray-300 focus:border-[#4731B6] focus:ring-2 focus:ring-[#4731B6]/20 rounded-lg py-2 pl-3 pr-8 text-xs sm:text-sm text-[#202020] outline-none cursor-pointer font-medium"
              >
                {periodeOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    Periode: {opt.label}
                  </option>
                ))}
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
          <table className="w-full text-left min-w-[760px] sm:min-w-full">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-[11px] sm:text-xs font-semibold text-[#5F5F5F]">
              <tr>
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap">NIP</th>
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap">Pegawai</th>
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap">Kehadiran</th>
                <th className="py-3 px-4 sm:px-5 text-center whitespace-nowrap">Lembur</th>
                <th className="py-3 px-4 sm:px-5 text-center whitespace-nowrap">Alpha</th>
                <th className="py-3 px-4 sm:px-5 text-center whitespace-nowrap">Sakit / Izin</th>
                <th className="py-3 px-4 sm:px-5 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-4 sm:px-5 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {paginatedItems.map((item) => (
                <tr key={item.idPegawai || item.nip} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:px-5 font-mono text-[#5F5F5F] whitespace-nowrap">{item.nip}</td>
                  <td className="py-3.5 px-4 sm:px-5 font-semibold text-[#202020] whitespace-nowrap">
                    <div>
                      <span>{item.pegawai}</span>
                      {item.jabatan && (
                        <span className="block text-[11px] font-normal text-gray-500">{item.jabatan}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-[#3F3F3F] whitespace-nowrap">
                    <span className="font-semibold text-[#0E6100]">{item.totalHadir} hadir</span>
                    {item.totalTerlambat > 0 && (
                      <span className="text-[11px] text-[#9A2500] block">{item.totalTerlambat} terlambat</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-center whitespace-nowrap">
                    {item.totalLembur > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F2F1F9] text-[#4731B6] border border-[#4731B6]/20">
                        {item.totalLembur}x
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">0x</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-center whitespace-nowrap">
                    {item.totalAlpha > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                        {item.totalAlpha}x
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">0x</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-center whitespace-nowrap">
                    {item.totalSakit > 0 || item.totalIzin > 0 ? (
                      <div className="text-xs">
                        {item.totalSakit > 0 && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 mr-1">
                            {item.totalSakit}x Sakit
                          </span>
                        )}
                        {item.totalIzin > 0 && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                            {item.totalIzin}x Izin
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-center whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
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
                  <td colSpan={8} className="py-8 text-center text-xs sm:text-sm text-[#7E7E7E]">
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
    </>
  )}

  {/* TAB 2: PENGAJUAN PRESENSI & IZIN */}
  {activeTab === "pengajuan" && (
    <>
      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">{submissions.length}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Total Pengajuan RS</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#F39C12]">{totalSubmissionsDiproses}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Menunggu Verifikasi</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#0E6100]">{totalSubmissionsDisetujui}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Telah Disetujui</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#9A2500]">{totalSubmissionsDitolak}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Ditolak</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={submissionSearch}
              onChange={(e) => {
                setSubmissionSearch(e.target.value);
                setSubmissionCurrentPage(1);
              }}
              placeholder="Cari nama pegawai, NIP, atau alasan pengajuan..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-xs sm:text-sm text-[#202020] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4731B6]/20 focus:border-[#4731B6]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5">
            <select
              value={submissionStatusFilter}
              onChange={(e) => {
                setSubmissionStatusFilter(e.target.value);
                setSubmissionCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:ring-2 focus:ring-[#4731B6]/20 focus:border-[#4731B6]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            <select
              value={submissionJenisFilter}
              onChange={(e) => {
                setSubmissionJenisFilter(e.target.value);
                setSubmissionCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:ring-2 focus:ring-[#4731B6]/20 focus:border-[#4731B6]"
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Izin Sakit">Izin Sakit</option>
              <option value="Cuti Tahunan">Cuti Tahunan</option>
              <option value="Tukar Shift">Tukar Shift</option>
              <option value="Koreksi Presensi">Koreksi Presensi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/90 overflow-hidden space-y-0">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#4731B6]" />
            <h3 className="font-bold text-sm sm:text-base text-[#202020]">
              Daftar Permohonan Presensi Pegawai ({filteredSubmissions.length})
            </h3>
          </div>
          {isSubmissionsLoading && <Loader2 className="w-4 h-4 animate-spin text-[#4731B6]" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-[11px] sm:text-xs font-semibold text-[#5F5F5F]">
              <tr>
                <th className="py-3 px-4">Pegawai</th>
                <th className="py-3 px-4">Jenis Pengajuan</th>
                <th className="py-3 px-4">Tanggal / Shift</th>
                <th className="py-3 px-4">Alasan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    {isSubmissionsLoading ? "Memuat pengajuan presensi..." : "Tidak ada pengajuan yang sesuai dengan kriteria filter."}
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-[#202020] block">{sub.pegawai}</span>
                        <span className="text-[11px] text-[#7E7E7E]">NIP: {sub.nip} · {sub.unit}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F2F1F9] text-[#4731B6] border border-[#C4BAF5]/50">
                        {sub.jenis}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#202020]">{sub.tanggalTarget}</div>
                      {sub.shiftTerkait && (
                        <div className="text-[11px] text-[#7E7E7E]">{sub.shiftTerkait}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="truncate text-[#5F5F5F] text-xs" title={sub.alasan}>
                        {sub.alasan}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sub.status === "Diproses" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveSubmission(sub.id, sub.pegawai)}
                              title="Setujui Pengajuan"
                              className="p-1.5 rounded-lg bg-[#D8F0D3] text-[#0E6100] hover:bg-[#c2e8bb] transition-colors cursor-pointer border border-[#0E6100]/20"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openRejectSubmissionDialog(sub)}
                              title="Tolak Pengajuan"
                              className="p-1.5 rounded-lg bg-[#FCDFD8] text-[#9A2500] hover:bg-[#fad0c6] transition-colors cursor-pointer border border-[#9A2500]/20"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setShowSubmissionDetailModal(true);
                          }}
                          className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:text-[#4731B6] hover:border-[#4731B6] transition-colors cursor-pointer bg-white"
                          title="Lihat Rincian"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={submissionCurrentPage}
          totalPages={totalSubmissionPages}
          onPageChange={setSubmissionCurrentPage}
          totalItems={filteredSubmissions.length}
          itemsPerPage={submissionItemsPerPage}
          onItemsPerPageChange={setSubmissionItemsPerPage}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>
    </>
  )}

  {/* Rincian Pegawai Modal (Untuk Tab Rekap) */}
  {selectedPegawai && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-gray-200 space-y-4 relative max-h-[90vh] overflow-y-auto">
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

        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <span className="text-[11px] font-semibold text-[#7E7E7E]">Profil Pegawai</span>
            <p className="font-bold text-sm text-[#202020]">{selectedPegawai.pegawai}</p>
            <p className="text-xs text-[#5F5F5F]">NIP: {selectedPegawai.nip} · {selectedPegawai.jabatan || "-"}</p>
            <p className="text-xs text-[#5F5F5F]">Penempatan: {selectedPegawai.unit || "-"}</p>
          </div>

          {/* Detail 4 Metrik Utama: Lembur, Alpha, Sakit, Izin */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#7E7E7E] block">
              Detail Rekap Kehadiran (Periode {periode})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-[#F2F1F9] rounded-xl border border-[#4731B6]/20 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-[#4731B6]">Lembur</span>
                <p className="text-xl font-bold text-[#4731B6] mt-1">{selectedPegawai.totalLembur} Kali</p>
                <span className="text-[10px] text-gray-500">Shift lembur dinas</span>
              </div>

              <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                selectedPegawai.totalAlpha > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
              }`}>
                <span className="text-[11px] font-medium text-red-600">Alpha</span>
                <p className={`text-xl font-bold mt-1 ${selectedPegawai.totalAlpha > 0 ? "text-red-600" : "text-gray-700"}`}>
                  {selectedPegawai.totalAlpha} Kali
                </p>
                <span className="text-[10px] text-gray-500">Tanpa keterangan</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-amber-700">Sakit</span>
                <p className="text-xl font-bold text-amber-700 mt-1">{selectedPegawai.totalSakit} Kali</p>
                <span className="text-[10px] text-gray-500">Surat dokter</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex flex-col justify-between">
                <span className="text-[11px] font-medium text-blue-700">Izin</span>
                <p className="text-xl font-bold text-blue-700 mt-1">{selectedPegawai.totalIzin} Kali</p>
                <span className="text-[10px] text-gray-500">Izin disetujui</span>
              </div>
            </div>
          </div>

          {/* Rincian Sekunder: Hadir, Terlambat, Cuti */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 block font-medium">Hadir Reguler</span>
              <span className="font-bold text-emerald-800 text-sm">{selectedPegawai.totalHadir} Hari</span>
            </div>
            <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-200">
              <span className="text-[10px] text-orange-700 block font-medium">Keterlambatan</span>
              <span className="font-bold text-orange-800 text-sm">{selectedPegawai.totalTerlambat} Kali</span>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-[10px] text-purple-700 block font-medium">Cuti Tahunan</span>
              <span className="font-bold text-purple-800 text-sm">{selectedPegawai.totalCuti} Hari</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#7E7E7E] block">Status Disiplin Pegawai</span>
              <span className="text-xs font-medium text-[#202020]">Evaluasi kehadiran periode ini</span>
            </div>
            <StatusBadge status={selectedPegawai.status} />
          </div>

          {selectedPegawai.shifts && selectedPegawai.shifts.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-[#7E7E7E] block">
                Riwayat Jadwal & Presensi ({selectedPegawai.shifts.length} Jadwal)
              </span>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                {selectedPegawai.shifts.map((s, idx) => (
                  <div
                    key={s.idAbsensi || s.idJadwal || idx}
                    className="p-2.5 flex items-center justify-between text-xs hover:bg-gray-50/70"
                  >
                    <div>
                      <p className="font-medium text-[#202020]">
                        {s.tanggal} · {s.jadwal?.jenisJadwal || "Shift Jaga"}
                      </p>
                      <p className="text-[11px] text-gray-500 font-mono">
                        {s.jamMasuk ? `${s.jamMasuk} - ${s.jamKeluar || "..."}` : "Tidak hadir"}
                        {s.durasi ? ` (${s.durasi})` : ""}
                      </p>
                    </div>
                    <StatusBadge status={s.status || s.statusKehadiran || "Hadir"} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedPegawai(null)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Modal Detail Submission (Untuk Tab Pengajuan) */}
  {showSubmissionDetailModal && selectedSubmission && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-xl p-5 sm:p-6 shadow-xl border border-gray-200 space-y-4 relative">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="font-bold text-base sm:text-lg text-[#202020]">
            Detail Pengajuan Presensi Pegawai
          </h3>
          <button
            type="button"
            onClick={() => setShowSubmissionDetailModal(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
            <span className="text-[11px] text-[#7E7E7E]">Nama Pegawai</span>
            <p className="font-bold text-sm text-[#202020]">{selectedSubmission.pegawai}</p>
            <p className="text-xs text-[#5F5F5F]">NIP: {selectedSubmission.nip} · {selectedSubmission.jabatan} ({selectedSubmission.unit})</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
              <span className="text-[11px] text-[#7E7E7E]">Jenis Pengajuan</span>
              <p className="font-bold text-[#4731B6]">{selectedSubmission.jenis}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
              <span className="text-[11px] text-[#7E7E7E]">Status Saat Ini</span>
              <div>
                <StatusBadge status={selectedSubmission.status} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
            <span className="text-[11px] text-[#7E7E7E]">Tanggal & Jadwal yang Diajukan</span>
            <p className="font-semibold text-[#202020]">{selectedSubmission.tanggalTarget}</p>
            {selectedSubmission.shiftTerkait && (
              <p className="text-xs text-[#5F5F5F]">{selectedSubmission.shiftTerkait}</p>
            )}
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
            <span className="text-[11px] text-[#7E7E7E]">Alasan Lengkap</span>
            <p className="text-[#3F3F3F] leading-relaxed">{selectedSubmission.alasan}</p>
          </div>

          {selectedSubmission.lampiran && (
            <div className="p-3 border border-gray-200 rounded-lg flex items-center justify-between text-xs bg-white">
              <div className="flex items-center gap-2 text-[#4731B6] font-medium truncate">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{selectedSubmission.lampiran}</span>
              </div>
              <button
                type="button"
                onClick={() => alert(`Membuka lampiran: ${selectedSubmission.lampiran}`)}
                className="text-[#4731B6] hover:underline font-semibold shrink-0 cursor-pointer ml-2"
              >
                Buka Lampiran
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2.5 pt-3 border-t border-gray-100">
          {selectedSubmission.status === "Diproses" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowSubmissionDetailModal(false);
                  openRejectSubmissionDialog(selectedSubmission);
                }}
                className="flex-1 py-2 px-4 rounded-lg border border-[#9A2500]/30 bg-[#FCDFD8] hover:bg-[#fad0c6] text-[#9A2500] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Tolak Pengajuan
              </button>
              <button
                type="button"
                onClick={() => handleApproveSubmission(selectedSubmission.id, selectedSubmission.pegawai)}
                disabled={isSubmittingAction}
                className="flex-1 py-2 px-4 rounded-lg bg-[#0E6100] hover:bg-[#0b4d00] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingAction ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Setujui Pengajuan"
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmissionDetailModal(false)}
              className="w-full py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#202020] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  )}

  {/* Modal Dialog Alasan Penolakan Submission */}
  {rejectTarget && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-xl p-5 sm:p-6 shadow-xl border border-gray-200 space-y-4 relative">
        <div className="flex items-center gap-3 text-[#9A2500] pb-2 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#202020]">Konfirmasi Penolakan</h3>
            <p className="text-xs text-gray-500">Pengajuan {rejectTarget.pegawai}</p>
          </div>
        </div>

        <form onSubmit={handleConfirmRejectSubmission} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#202020]">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Berikan alasan penolakan untuk pegawai terkait..."
              className="w-full p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none resize-none"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              disabled={isSubmittingAction}
              className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmittingAction ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Konfirmasi Tolak"
              )}
            </button>
            <button
              type="button"
              onClick={() => setRejectTarget(null)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
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
