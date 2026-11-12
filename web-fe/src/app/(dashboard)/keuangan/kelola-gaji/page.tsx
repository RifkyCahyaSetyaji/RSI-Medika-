"use client";

import React, { useState } from "react";
import {
  Download,
  Search,
  CheckCircle2,
  X,
  CreditCard,
  Eye,
  Calendar,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";

interface PayrollEmployee {
  id: string;
  nip: string;
  nama: string;
  unit: string;
  jabatan: string;
  periode: string;
  gajiPokok: number;
  tunjangan: number;
  potongan: number;
  gajiDidapatkan: number;
  status: "Terbayar" | "Diproses" | "Tertunda";
  bank: string;
  tanggalTransfer: string;
}

export default function KeuanganKelolaGajiPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Mei 2025");
  const [search, setSearch] = useState<string>("");
  const [unitFilter, setUnitFilter] = useState<string>("Semua");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [selectedEmp, setSelectedEmp] = useState<PayrollEmployee | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const [employees, setEmployees] = useState<PayrollEmployee[]>([
    {
      id: "PAY-001",
      nip: "198904122014022001",
      nama: "Ns. Ayu Lestari, S.Kep., Ns.",
      unit: "Unit Rawat Inap",
      jabatan: "Perawat Pelaksana",
      periode: "Mei 2025",
      gajiPokok: 5250000,
      tunjangan: 3000000,
      potongan: 1370000,
      gajiDidapatkan: 6880000,
      status: "Terbayar",
      bank: "Mandiri 1400018482103",
      tanggalTransfer: "30 Mei 2025",
    },
    {
      id: "PAY-002",
      nip: "198811032013011002",
      nama: "Bima Pratama, A.Md.Kep.",
      unit: "Unit Rawat Inap",
      jabatan: "Perawat Pelaksana",
      periode: "Mei 2025",
      gajiPokok: 4850000,
      tunjangan: 2500000,
      potongan: 1150000,
      gajiDidapatkan: 6200000,
      status: "Terbayar",
      bank: "Mandiri 1400018482188",
      tanggalTransfer: "30 Mei 2025",
    },
    {
      id: "PAY-003",
      nip: "198006122007011002",
      nama: "dr. Hendra Wijaya, Sp.A",
      unit: "Poliklinik Anak",
      jabatan: "Dokter Spesialis",
      periode: "Mei 2025",
      gajiPokok: 12500000,
      tunjangan: 9800000,
      potongan: 3200000,
      gajiDidapatkan: 19100000,
      status: "Terbayar",
      bank: "BCA 8219028192",
      tanggalTransfer: "30 Mei 2025",
    },
    {
      id: "PAY-004",
      nip: "199103202015022002",
      nama: "Rizky Ramadhani, A.Md.",
      unit: "Unit Rawat Inap",
      jabatan: "Sekretaris Unit",
      periode: "Mei 2025",
      gajiPokok: 4500000,
      tunjangan: 2100000,
      potongan: 950000,
      gajiDidapatkan: 5650000,
      status: "Terbayar",
      bank: "Mandiri 1400019201923",
      tanggalTransfer: "30 Mei 2025",
    },
    {
      id: "PAY-005",
      nip: "198205152008011003",
      nama: "Athaya Rahmania, S.Psi.",
      unit: "Divisi SDM & HRD",
      jabatan: "Staff Senior HRD",
      periode: "Mei 2025",
      gajiPokok: 6200000,
      tunjangan: 2600000,
      potongan: 1350000,
      gajiDidapatkan: 7450000,
      status: "Terbayar",
      bank: "Mandiri 1400019920194",
      tanggalTransfer: "30 Mei 2025",
    },
    {
      id: "PAY-006",
      nip: "199402182019022005",
      nama: "Ns. Dewi Sartika, S.Kep.",
      unit: "Kamar Bedah (OK)",
      jabatan: "Perawat Bedah",
      periode: "Mei 2025",
      gajiPokok: 5250000,
      tunjangan: 3100000,
      potongan: 1300000,
      gajiDidapatkan: 7050000,
      status: "Diproses",
      bank: "BNI 0829102910",
      tanggalTransfer: "Menunggu Approval",
    },
    {
      id: "PAY-007",
      nip: "199205142018022004",
      nama: "Ns. Rani Oktavia, S.Kep.",
      unit: "Unit Rawat Inap",
      jabatan: "Perawat Pelaksana",
      periode: "Mei 2025",
      gajiPokok: 5000000,
      tunjangan: 2800000,
      potongan: 1250000,
      gajiDidapatkan: 6550000,
      status: "Diproses",
      bank: "Mandiri 1400019829102",
      tanggalTransfer: "Menunggu Approval",
    },
  ]);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.nama.toLowerCase().includes(search.toLowerCase()) ||
      emp.nip.includes(search) ||
      emp.unit.toLowerCase().includes(search.toLowerCase());

    const matchesUnit = unitFilter === "Semua" || emp.unit === unitFilter;
    const matchesStatus = statusFilter === "Semua" || emp.status === statusFilter;

    return matchesSearch && matchesUnit && matchesStatus;
  });

  // Calculate metrics
  const totalGajiDidapatkan = employees
    .filter((e) => e.status === "Terbayar")
    .reduce((sum, e) => sum + e.gajiDidapatkan, 0);

  const totalPotongan = employees
    .reduce((sum, e) => sum + e.potongan, 0);

  const totalPegawaiTerbayar = employees.filter((e) => e.status === "Terbayar").length;

  const handleDisbursePayroll = () => {
    setEmployees((prev) =>
      prev.map((e) => ({ ...e, status: "Terbayar" as const, tanggalTransfer: "30 Mei 2025" }))
    );
    setToastMessage("Pencairan payroll seluruh pegawai berhasil diproses ke Bank Partner!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Periode Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
            Kelola Gaji Pegawai
          </h2>
          <p className="text-xs sm:text-sm text-[#5F5F5F]">
            Monitoring realisasi payroll rumah sakit, perincian slip, dan validasi gaji yang sudah didapatkan pegawai.
          </p>
        </div>

        {/* Periode Selector */}
        <div className="flex items-center gap-2.5 bg-white p-2 sm:p-2.5 rounded-2xl border border-black/5 shadow-xs shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#4731B6] px-2">
            <Calendar className="w-4 h-4" />
            <span>Periode Gaji:</span>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#F2F1F9] text-xs sm:text-sm font-bold text-[#4731B6] border border-[#C4BAF5] cursor-pointer focus:outline-none"
          >
            <option value="Mei 2025">Mei 2025 (Aktif)</option>
            <option value="April 2025">April 2025</option>
            <option value="Maret 2025">Maret 2025</option>
            <option value="Februari 2025">Februari 2025</option>
            <option value="Januari 2025">Januari 2025</option>
          </select>
        </div>
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

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Gaji Yang Sudah Didapatkan Pegawai */}
        <div className="bg-white rounded-[20px] p-5 shadow-xs border border-black/5 space-y-2">
          <span className="text-xs font-semibold text-[#7E7E7E]">
            Gaji yang Sudah Didapatkan Pegawai
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#4731B6] tracking-tight">
            {formatRupiah(totalGajiDidapatkan)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#0E6100]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Telah disalurkan ke rekening pegawai</span>
          </div>
        </div>

        {/* Card 2: Pegawai Menerima Gaji */}
        <div className="bg-white rounded-[20px] p-5 shadow-xs border border-black/5 space-y-2">
          <span className="text-xs font-semibold text-[#7E7E7E]">Pegawai Menerima Gaji</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#202020] tracking-tight">
            {totalPegawaiTerbayar} / {employees.length}{" "}
            <span className="text-xs font-medium text-[#5F5F5F]">Pegawai</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0E6100] h-full rounded-full transition-all duration-500"
              style={{ width: `${(totalPegawaiTerbayar / employees.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 3: Total Potongan & BPJS */}
        <div className="bg-white rounded-[20px] p-5 shadow-xs border border-black/5 space-y-2">
          <span className="text-xs font-semibold text-[#7E7E7E]">Total Potongan & Pajak</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#9A2500] tracking-tight">
            {formatRupiah(totalPotongan)}
          </div>
          <p className="text-[11px] text-[#7E7E7E]">BPJS Kes, Ketenagakerjaan & PPh 21</p>
        </div>

        {/* Card 4: Status Payroll Periode Ini */}
        <div className="bg-white rounded-[20px] p-5 shadow-xs border border-black/5 space-y-2 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#7E7E7E]">Status Periode {selectedPeriod}</span>
          <div className="flex items-center gap-2">
            <StatusBadge status="Terbayar" />
            <span className="text-xs font-medium text-[#5F5F5F]">Bank Mandiri Corporate</span>
          </div>
          <button
            type="button"
            onClick={handleDisbursePayroll}
            className="w-full py-2 px-3 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pencairan Sisa Gaji</span>
          </button>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-[20px] sm:rounded-[28px] p-5 sm:p-7 shadow-xs border border-black/5 space-y-4">
        {/* Search & Action Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7E7E7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pegawai, NIP, atau unit kerja..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-[#202020] placeholder:text-gray-400 focus:outline-none focus:border-[#4731B6]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:border-[#4731B6]"
            >
              <option value="Semua">Semua Unit</option>
              <option value="Unit Rawat Inap">Unit Rawat Inap</option>
              <option value="Poliklinik Anak">Poliklinik Anak</option>
              <option value="Kamar Bedah (OK)">Kamar Bedah (OK)</option>
              <option value="Divisi SDM & HRD">Divisi SDM & HRD</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:border-[#4731B6]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Terbayar">Terbayar</option>
              <option value="Diproses">Diproses</option>
            </select>

            <button
              type="button"
              onClick={() => alert(`Laporan Payroll Periode ${selectedPeriod} berhasil diexport ke format Excel!`)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-[#3F3F3F] text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#4731B6]" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] sm:text-xs font-semibold text-[#7E7E7E]">
                <th className="pb-3 px-3 sm:px-4">Pegawai & NIP</th>
                <th className="pb-3 px-3 sm:px-4">Unit & Jabatan</th>
                <th className="pb-3 px-3 sm:px-4">Periode Gaji</th>
                <th className="pb-3 px-3 sm:px-4 text-right">Pendapatan Kotor</th>
                <th className="pb-3 px-3 sm:px-4 text-right">Potongan</th>
                <th className="pb-3 px-3 sm:px-4 text-right font-bold text-[#4731B6]">
                  Gaji yang Didapatkan
                </th>
                <th className="pb-3 px-3 sm:px-4 text-center">Status</th>
                <th className="pb-3 px-3 sm:px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Tidak ada data pegawai yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4">
                      <div>
                        <span className="font-bold text-[#202020] block">{emp.nama}</span>
                        <span className="text-[11px] text-[#7E7E7E]">NIP: {emp.nip}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <div>
                        <span className="font-medium text-[#202020] block">{emp.jabatan}</span>
                        <span className="text-[11px] text-[#5F5F5F]">{emp.unit}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <span className="font-medium text-[#202020]">{emp.periode}</span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right font-medium text-[#202020]">
                      {formatRupiah(emp.gajiPokok + emp.tunjangan)}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right font-medium text-[#9A2500]">
                      - {formatRupiah(emp.potongan)}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right font-extrabold text-[#4731B6]">
                      {formatRupiah(emp.gajiDidapatkan)}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmp(emp);
                          setShowDetailModal(true);
                        }}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#4731B6] hover:border-[#4731B6] transition-colors cursor-pointer"
                        title="Lihat Rincian Slip Gaji"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Detail Modal */}
      {showDetailModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 shadow-2xl border border-gray-100 space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Rincian Slip Gaji Pegawai
              </h3>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[11px] text-[#7E7E7E]">Nama Pegawai</span>
                <p className="font-bold text-sm text-[#202020]">{selectedEmp.nama}</p>
                <p className="text-xs text-[#5F5F5F]">NIP: {selectedEmp.nip} · {selectedEmp.unit}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-[11px] text-[#7E7E7E]">Periode Gaji</span>
                  <p className="font-bold text-[#4731B6]">{selectedEmp.periode}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-[11px] text-[#7E7E7E]">Status Transfer</span>
                  <div>
                    <StatusBadge status={selectedEmp.status} />
                  </div>
                </div>
              </div>

              {/* Rincian Komponen */}
              <div className="space-y-2 border border-gray-100 rounded-xl p-3">
                <div className="flex justify-between py-1 text-[#3F3F3F]">
                  <span>Gaji Pokok</span>
                  <span className="font-semibold text-[#202020]">{formatRupiah(selectedEmp.gajiPokok)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#3F3F3F]">
                  <span>Tunjangan & Peran</span>
                  <span className="font-semibold text-[#202020]">{formatRupiah(selectedEmp.tunjangan)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#3F3F3F]">
                  <span>Total Potongan & BPJS</span>
                  <span className="font-semibold text-[#9A2500]">- {formatRupiah(selectedEmp.potongan)}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-[#202020]">Gaji yang Sudah Didapatkan</span>
                  <span className="font-extrabold text-base text-[#4731B6]">
                    {formatRupiah(selectedEmp.gajiDidapatkan)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#F2F1F9] rounded-xl text-xs space-y-0.5">
                <span className="text-[#5F5F5F]">Rekening Bank Penggajian:</span>
                <p className="font-semibold text-[#4731B6]">{selectedEmp.bank}</p>
                <p className="text-[11px] text-[#7E7E7E]">Tanggal transfer: {selectedEmp.tanggalTransfer}</p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => alert(`Slip gaji PDF ${selectedEmp.nama} periode ${selectedEmp.periode} berhasil diunduh.`)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Slip PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
