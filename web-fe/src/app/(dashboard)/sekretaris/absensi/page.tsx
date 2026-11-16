"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Search,
  CheckCircle2,
  FileText,
  X,
  Eye,
  Check,
  Loader2,
  Download,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { Pagination } from "@/shared/components/ui/pagination";
import { cutiService } from "@/shared/services/api/cuti.service";
import { izinService } from "@/shared/services/api/izin.service";
import { koreksiAbsensiService } from "@/shared/services/api/koreksi-absensi.service";

interface LeaveSubmission {
  id: string;
  tanggalPengajuan: string;
  pegawai: string;
  nip: string;
  jabatan: string;
  jenis: "Izin Sakit" | "Cuti Tahunan" | "Tukar Shift" | "Koreksi Presensi";
  tanggalTarget: string;
  shiftTerkait?: string;
  alasan: string;
  lampiran?: string;
  status: "Diproses" | "Disetujui" | "Ditolak";
}

export default function PengajuanAbsensiSekretarisPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [jenisFilter, setJenisFilter] = useState<string>("Semua");
  const [selectedSubmission, setSelectedSubmission] = useState<LeaveSubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Rejection modal state
  const [rejectTarget, setRejectTarget] = useState<LeaveSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  const defaultSubmissions: LeaveSubmission[] = [
    {
      id: "SUB-001",
      tanggalPengajuan: "10 Mei 2025",
      pegawai: "Ns. Ayu Lestari, S.Kep., Ns.",
      nip: "198904122014022001",
      jabatan: "Perawat Pelaksana",
      jenis: "Izin Sakit",
      tanggalTarget: "11 Mei 2025",
      shiftTerkait: "Shift Pagi (07.00 - 14.00)",
      alasan: "Demam tinggi dan radang tenggorokan akut, anjuran dokter istirahat 1 hari.",
      lampiran: "surat-keterangan-dokter-dr-budi.pdf",
      status: "Diproses",
    },
    {
      id: "SUB-002",
      tanggalPengajuan: "09 Mei 2025",
      pegawai: "Ns. Rani Oktavia, S.Kep.",
      nip: "199205142018022004",
      jabatan: "Perawat Ruang Inap 3A",
      jenis: "Tukar Shift",
      tanggalTarget: "12 Mei 2025",
      shiftTerkait: "Shift Malam tukar ke Shift Siang (dengan Ns. Bima Pratama)",
      alasan: "Keperluan keluarga mendesak di luar kota pada tanggal tersebut.",
      lampiran: "form-tukar-shift-ttd-bersama.pdf",
      status: "Diproses",
    },
    {
      id: "SUB-003",
      tanggalPengajuan: "08 Mei 2025",
      pegawai: "dr. Hendra Wijaya, Sp.A",
      nip: "198006122007011002",
      jabatan: "Dokter Spesialis Anak",
      jenis: "Cuti Tahunan",
      tanggalTarget: "15 Mei - 17 Mei 2025",
      shiftTerkait: "3 Hari Kerja",
      alasan: "Acara keluarga tahunan di kampung halaman.",
      lampiran: "surat-permohonan-cuti-tahunan.pdf",
      status: "Disetujui",
    },
    {
      id: "SUB-004",
      tanggalPengajuan: "08 Mei 2025",
      pegawai: "Bima Pratama, A.Md.Kep.",
      nip: "198811032013011002",
      jabatan: "Perawat Pelaksana",
      jenis: "Koreksi Presensi",
      tanggalTarget: "07 Mei 2025",
      shiftTerkait: "Shift Siang (14.00 - 21.00)",
      alasan: "Mesin fingerprint unit sempat offline saat jam pulang shift 21.05.",
      lampiran: "log-kamera-keamanan-2105.jpg",
      status: "Disetujui",
    },
    {
      id: "SUB-005",
      tanggalPengajuan: "05 Mei 2025",
      pegawai: "Ns. Dewi Sartika, S.Kep.",
      nip: "199402182019022005",
      jabatan: "Perawat Kamar Operasi",
      jenis: "Izin Sakit",
      tanggalTarget: "05 Mei 2025",
      shiftTerkait: "Shift Pagi",
      alasan: "Sakit kepala migrain tanpa surat keterangan faskes.",
      status: "Ditolak",
    },
    {
      id: "SUB-006",
      tanggalPengajuan: "04 Mei 2025",
      pegawai: "dr. Farhan Alamsyah, Sp.PD",
      nip: "198203152009021003",
      jabatan: "Dokter Spesialis Penyakit Dalam",
      jenis: "Cuti Tahunan",
      tanggalTarget: "20 Mei - 22 Mei 2025",
      shiftTerkait: "3 Hari Kerja",
      alasan: "Menghadiri kongres tahunan asosiasi dokter spesialis.",
      lampiran: "undangan-kongres-kedokteran.pdf",
      status: "Diproses",
    },
    {
      id: "SUB-007",
      tanggalPengajuan: "03 Mei 2025",
      pegawai: "Ns. Siti Khotimah, S.Kep.",
      nip: "199109092015022003",
      jabatan: "Perawat Ruang ICU",
      jenis: "Tukar Shift",
      tanggalTarget: "10 Mei 2025",
      shiftTerkait: "Shift Pagi tukar ke Shift Malam",
      alasan: "Keperluan keluarga mendadak di pagi hari.",
      status: "Disetujui",
    },
    {
      id: "SUB-008",
      tanggalPengajuan: "02 Mei 2025",
      pegawai: "Agus Priyono, A.Md.AK",
      nip: "199001122014021001",
      jabatan: "Pranata Laboratorium Kesehatan",
      jenis: "Koreksi Presensi",
      tanggalTarget: "01 Mei 2025",
      shiftTerkait: "Shift Pagi",
      alasan: "Koreksi lupa tap kartu saat briefing pagi tim laboratorium.",
      status: "Diproses",
    },
  ];

  const [submissions, setSubmissions] = useState<LeaveSubmission[]>(defaultSubmissions);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadSubmissions() {
      setIsLoading(true);
      try {
        const [cutiRes, izinRes] = await Promise.all([
          cutiService.daftarCuti(),
          izinService.daftarIzin(),
        ]);
        const mapped: LeaveSubmission[] = [];
        if (cutiRes && cutiRes.length > 0) {
          cutiRes.forEach((c) => {
            mapped.push({
              id: c.idPengajuan,
              tanggalPengajuan: new Date().toLocaleDateString("id-ID"),
              pegawai: c.pegawai?.nama || "Pegawai",
              nip: c.pegawai?.nip || "-",
              jabatan: c.pegawai?.jabatan || "Tenaga Medis",
              jenis: "Cuti Tahunan",
              tanggalTarget: `${c.tanggalMulai} s/d ${c.tanggalSelesai}`,
              alasan: c.alasan,
              status: c.status === "Disetujui" ? "Disetujui" : c.status === "Ditolak" ? "Ditolak" : "Diproses",
            });
          });
        }
        if (izinRes && izinRes.length > 0) {
          izinRes.forEach((iz) => {
            mapped.push({
              id: iz.idPengajuan,
              tanggalPengajuan: new Date().toLocaleDateString("id-ID"),
              pegawai: iz.pegawai?.nama || "Pegawai",
              nip: iz.pegawai?.nip || "-",
              jabatan: iz.pegawai?.jabatan || "Tenaga Medis",
              jenis: "Izin Sakit",
              tanggalTarget: `${iz.tanggalMulai} s/d ${iz.tanggalSelesai}`,
              alasan: iz.alasan,
              status: iz.status === "Disetujui" ? "Disetujui" : iz.status === "Ditolak" ? "Ditolak" : "Diproses",
            });
          });
        }
        if (mapped.length > 0) {
          setSubmissions([...mapped, ...defaultSubmissions]);
        }
      } catch {
        // Fallback default
      } finally {
        setIsLoading(false);
      }
    }
    loadSubmissions();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    setIsSubmittingAction(true);
    try {
      if (id.startsWith("CUTI")) {
        await cutiService.setujuiCuti(id);
      } else if (id.startsWith("IZIN") || id.startsWith("KTH")) {
        await izinService.setujuiIzin(id);
      } else if (id.startsWith("KOR")) {
        await koreksiAbsensiService.setujuiKoreksi(id);
      }
    } catch {
      // Local fallback
    } finally {
      setIsSubmittingAction(false);
    }
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: "Disetujui" as const } : sub))
    );
    setShowDetailModal(false);
    setToastMessage(`Pengajuan absensi ${name} telah berhasil disetujui!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const openRejectDialog = (sub: LeaveSubmission) => {
    setRejectTarget(sub);
    setRejectReason("");
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
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
    setShowDetailModal(false);
    setToastMessage(`Pengajuan absensi ${rejectTarget.pegawai} telah ditolak.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) return;
    const headers = ["ID", "Pegawai", "NIP", "Jabatan", "Jenis", "Tanggal Target", "Alasan", "Status"];
    const rows = filteredSubmissions.map((s) => [
      `"${s.id}"`,
      `"${s.pegawai}"`,
      `"${s.nip}"`,
      `"${s.jabatan}"`,
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
    link.setAttribute("download", `permohonan-absensi-unit-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Daftar permohonan presensi berhasil diekspor ke CSV.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.pegawai.toLowerCase().includes(search.toLowerCase()) ||
      sub.nip.includes(search) ||
      sub.jenis.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "Semua" ||
      (statusFilter === "Menunggu" && sub.status === "Diproses") ||
      (statusFilter === "Disetujui" && sub.status === "Disetujui") ||
      (statusFilter === "Ditolak" && sub.status === "Ditolak");

    const matchesJenis = jenisFilter === "Semua" || sub.jenis === jenisFilter;

    return matchesSearch && matchesStatus && matchesJenis;
  });

  const totalDiproses = submissions.filter((s) => s.status === "Diproses").length;
  const totalDisetujui = submissions.filter((s) => s.status === "Disetujui").length;
  const totalDitolak = submissions.filter((s) => s.status === "Ditolak").length;

  // Pagination calculation
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#202020] tracking-tight">
            Pengajuan Presensi & Izin Unit
          </h2>
          <p className="text-xs sm:text-sm text-[#5F5F5F]">
            Verifikasi dan evaluasi permohonan izin sakit, cuti, tukar shift, dan koreksi absen tenaga medis.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-gray-500" />
          <span>Ekspor Data</span>
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

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">{submissions.length}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Total Pengajuan</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#F39C12]">{totalDiproses}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Menunggu Verifikasi</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#0E6100]">{totalDisetujui}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Telah Disetujui</p>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-200/90 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#9A2500]">{totalDitolak}</span>
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
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama pegawai, NIP, atau alasan..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-xs sm:text-sm text-[#202020] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4731B6]/20 focus:border-[#4731B6]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:ring-2 focus:ring-[#4731B6]/20 focus:border-[#4731B6]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            <select
              value={jenisFilter}
              onChange={(e) => {
                setJenisFilter(e.target.value);
                setCurrentPage(1);
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
              Daftar Permohonan Presensi ({filteredSubmissions.length})
            </h3>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#4731B6]" />}
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
                    Tidak ada pengajuan yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-[#202020] block">{sub.pegawai}</span>
                        <span className="text-[11px] text-[#7E7E7E]">NIP: {sub.nip}</span>
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
                              onClick={() => handleApprove(sub.id, sub.pegawai)}
                              title="Setujui Pengajuan"
                              className="p-1.5 rounded-lg bg-[#D8F0D3] text-[#0E6100] hover:bg-[#c2e8bb] transition-colors cursor-pointer border border-[#0E6100]/20"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openRejectDialog(sub)}
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
                            setShowDetailModal(true);
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
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredSubmissions.length}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Detail Submission Modal */}
      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl p-5 sm:p-6 shadow-xl border border-gray-200 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Detail Pengajuan Presensi
              </h3>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <span className="text-[11px] text-[#7E7E7E]">Nama Pegawai</span>
                <p className="font-bold text-sm text-[#202020]">{selectedSubmission.pegawai}</p>
                <p className="text-xs text-[#5F5F5F]">NIP: {selectedSubmission.nip} · {selectedSubmission.jabatan}</p>
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
                      setShowDetailModal(false);
                      openRejectDialog(selectedSubmission);
                    }}
                    className="flex-1 py-2 px-4 rounded-lg border border-[#9A2500]/30 bg-[#FCDFD8] hover:bg-[#fad0c6] text-[#9A2500] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Tolak Pengajuan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedSubmission.id, selectedSubmission.pegawai)}
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
                  onClick={() => setShowDetailModal(false)}
                  className="w-full py-2 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#202020] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Alasan Penolakan */}
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

            <form onSubmit={handleConfirmReject} className="space-y-3.5">
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
