"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Search,
  CheckCircle2,
  FileText,
  X,
  Eye,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";

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

  const [submissions, setSubmissions] = useState<LeaveSubmission[]>([
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
  ]);

  const handleApprove = (id: string, name: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: "Disetujui" as const } : sub))
    );
    setShowDetailModal(false);
    setToastMessage(`Pengajuan absensi ${name} telah disetujui!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleReject = (id: string, name: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: "Ditolak" as const } : sub))
    );
    setShowDetailModal(false);
    setToastMessage(`Pengajuan absensi ${name} telah ditolak.`);
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

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
          Pengajuan Absensi Unit
        </h2>
        <p className="text-xs sm:text-sm text-[#5F5F5F]">
          Verifikasi dan kelola permohonan izin, cuti, tukar shift, dan koreksi presensi tenaga medis Unit Rawat Inap.
        </p>
      </div>

      {showToast && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setShowToast(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#4731B6]">{submissions.length}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Total Pengajuan</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#F39C12]">{totalDiproses}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Menunggu Verifikasi</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#0E6100]">{totalDisetujui}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Disetujui</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-xs border border-black/5 space-y-1">
          <span className="text-2xl sm:text-3xl font-bold text-[#9A2500]">{totalDitolak}</span>
          <p className="text-xs font-medium text-[#7E7E7E]">Ditolak</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-black/5 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7E7E7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pegawai, NIP, atau jenis pengajuan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#202020] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4731B6]/20 focus:border-[#4731B6]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:border-[#4731B6]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:border-[#4731B6]"
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
      <div className="bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 shadow-xs border border-black/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#4731B6]" />
            <h3 className="font-bold text-sm sm:text-base text-[#202020]">
              Daftar Permohonan Presensi ({filteredSubmissions.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] sm:text-xs font-semibold text-[#7E7E7E]">
                <th className="pb-3 px-3 sm:px-4">Pegawai</th>
                <th className="pb-3 px-3 sm:px-4">Jenis Pengajuan</th>
                <th className="pb-3 px-3 sm:px-4">Tanggal / Shift</th>
                <th className="pb-3 px-3 sm:px-4">Alasan</th>
                <th className="pb-3 px-3 sm:px-4 text-center">Status</th>
                <th className="pb-3 px-3 sm:px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Tidak ada pengajuan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4">
                      <div>
                        <span className="font-bold text-[#202020] block">{sub.pegawai}</span>
                        <span className="text-[11px] text-[#7E7E7E]">NIP: {sub.nip}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F2F1F9] text-[#4731B6] border border-[#C4BAF5]/50">
                        {sub.jenis}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="font-medium text-[#202020]">{sub.tanggalTarget}</div>
                      {sub.shiftTerkait && (
                        <div className="text-[11px] text-[#7E7E7E]">{sub.shiftTerkait}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 max-w-[200px]">
                      <p className="truncate text-[#5F5F5F] text-xs" title={sub.alasan}>
                        {sub.alasan}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sub.status === "Diproses" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(sub.id, sub.pegawai)}
                              title="Setujui Pengajuan"
                              className="p-1.5 rounded-lg bg-[#D8F0D3] text-[#0E6100] hover:bg-[#c2e8bb] transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(sub.id, sub.pegawai)}
                              title="Tolak Pengajuan"
                              className="p-1.5 rounded-lg bg-[#FCDFD8] text-[#9A2500] hover:bg-[#fad0c6] transition-colors cursor-pointer"
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
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#4731B6] hover:border-[#4731B6] transition-colors cursor-pointer"
                          title="Lihat Detail"
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
      </div>

      {/* Detail Submission Modal */}
      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 shadow-2xl border border-gray-100 space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Detail Pengajuan Absensi
              </h3>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[11px] text-[#7E7E7E]">Nama Pegawai</span>
                <p className="font-bold text-sm text-[#202020]">{selectedSubmission.pegawai}</p>
                <p className="text-xs text-[#5F5F5F]">NIP: {selectedSubmission.nip} · {selectedSubmission.jabatan}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-[11px] text-[#7E7E7E]">Jenis Pengajuan</span>
                  <p className="font-bold text-[#4731B6]">{selectedSubmission.jenis}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-[11px] text-[#7E7E7E]">Status</span>
                  <div>
                    <StatusBadge status={selectedSubmission.status} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[11px] text-[#7E7E7E]">Tanggal & Jadwal yang Diajukan</span>
                <p className="font-semibold text-[#202020]">{selectedSubmission.tanggalTarget}</p>
                {selectedSubmission.shiftTerkait && (
                  <p className="text-xs text-[#5F5F5F]">{selectedSubmission.shiftTerkait}</p>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[11px] text-[#7E7E7E]">Alasan Lengkap</span>
                <p className="text-[#3F3F3F] leading-relaxed">{selectedSubmission.alasan}</p>
              </div>

              {selectedSubmission.lampiran && (
                <div className="p-3 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#4731B6] font-medium truncate">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{selectedSubmission.lampiran}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Membuka lampiran: ${selectedSubmission.lampiran}`)}
                    className="text-[#4731B6] hover:underline font-semibold shrink-0 cursor-pointer ml-2"
                  >
                    Buka
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-gray-100">
              {selectedSubmission.status === "Diproses" ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleReject(selectedSubmission.id, selectedSubmission.pegawai)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-[#9A2500]/30 bg-[#FCDFD8] hover:bg-[#fad0c6] text-[#9A2500] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Tolak Pengajuan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedSubmission.id, selectedSubmission.pegawai)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#0E6100] hover:bg-[#0b4d00] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Setujui Pengajuan
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#202020] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
