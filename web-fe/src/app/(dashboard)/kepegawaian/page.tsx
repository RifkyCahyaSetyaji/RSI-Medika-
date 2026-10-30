"use client";

import React, { useState } from "react";
import {
  Search,
  UserPlus,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";

interface PegawaiItem {
  nip: string;
  nama: string;
  jabatan: string;
  unit: string;
  status: string;
  email?: string;
  noTelp?: string;
}

export default function KepegawaianPage() {
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState("Mei 2025");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiItem | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [pegawaiList, setPegawaiList] = useState<PegawaiItem[]>([
    {
      nip: "198904122014022001",
      nama: "Ayu Lestari",
      jabatan: "Perawat",
      unit: "Rawat Inap",
      status: "Diproses",
      email: "ayu.lestari@medika.hospital",
      noTelp: "081234567890",
    },
    {
      nip: "198811032013011002",
      nama: "Bima Pratama",
      jabatan: "Dokter Umum",
      unit: "IGD",
      status: "Diproses",
      email: "bima.pratama@medika.hospital",
      noTelp: "081234567891",
    },
    {
      nip: "199205142018022004",
      nama: "Rani Oktavia",
      jabatan: "Perawat",
      unit: "ICU",
      status: "Diproses",
      email: "rani.oktavia@medika.hospital",
      noTelp: "081234567892",
    },
    {
      nip: "198706232012011003",
      nama: "Dedi Kurnia",
      jabatan: "Perawat",
      unit: "Rawat Jalan",
      status: "Cuti",
      email: "dedi.kurnia@medika.hospital",
      noTelp: "081234567893",
    },
    {
      nip: "198501192010011001",
      nama: "dr. Hendra Prasetya, Sp.PD",
      jabatan: "Dokter Spesialis",
      unit: "Poli Penyakit Dalam",
      status: "Hadir",
      email: "hendra.prasetya@medika.hospital",
      noTelp: "081234567894",
    },
  ]);

  // Form Tambah Pegawai state
  const [formData, setFormData] = useState({
    nip: "",
    nama: "",
    email: "",
    noTelp: "",
    jabatan: "Perawat",
    unit: "Rawat Inap",
    statusPegawai: "Aktif",
    tanggalMasuk: "2026-10-01",
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPegawai: PegawaiItem = {
      nip: formData.nip,
      nama: formData.nama,
      jabatan: formData.jabatan,
      unit: formData.unit,
      status: "Diproses",
      email: formData.email,
      noTelp: formData.noTelp,
    };
    setPegawaiList([newPegawai, ...pegawaiList]);
    setShowAddModal(false);
    setToastMsg(`Pegawai baru "${formData.nama}" berhasil ditambahkan!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleDeletePegawai = (nip: string) => {
    if (confirm("Apakah Anda yakin ingin menonaktifkan / menghapus data pegawai ini?")) {
      setPegawaiList(pegawaiList.filter((p) => p.nip !== nip));
      setShowManageModal(false);
      setToastMsg("Data pegawai berhasil dihapus.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }
  };

  const filtered = pegawaiList.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.nip.includes(search) ||
      p.jabatan.toLowerCase().includes(search.toLowerCase()) ||
      p.unit.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
          Kepegawaian
        </h2>
        <p className="text-xs sm:text-sm text-[#5F5F5F]">
          Kelola data dan status seluruh pegawai rumah sakit.
        </p>
      </div>

      {showToast && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-xs sm:text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setShowToast(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-1 max-w-2xl">
          {/* Search Field */}
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Pencarian</span>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari data nama, NIP, atau unit..."
                className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] focus:ring-1 focus:ring-[#4731B6] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#202020] outline-none"
              />
            </div>
          </div>

          {/* Filter Periode */}
          <div className="w-full sm:w-44 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Filter periode</span>
            <div className="relative">
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full appearance-none bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-[#202020] outline-none cursor-pointer"
              >
                <option value="Mei 2025">Mei 2025</option>
                <option value="Juni 2025">Juni 2025</option>
                <option value="Oktober 2026">Oktober 2026</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tambah Pegawai Button */}
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto py-2.5 px-5 sm:px-6 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah pegawai</span>
          </button>
        </div>
      </div>

      {/* Pegawai Table */}
      <div className="bg-white rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-xs border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px] sm:min-w-full">
            <thead>
              <tr className="bg-[#4731B6] text-white text-xs font-semibold tracking-wider">
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">NIP</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Nama</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Jabatan</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Unit</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {filtered.map((item) => (
                <tr key={item.nip} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-mono text-[#5F5F5F] whitespace-nowrap">
                    {item.nip}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-bold text-[#202020] whitespace-nowrap">
                    {item.nama}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-[#3F3F3F] whitespace-nowrap">
                    {item.jabatan}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-[#3F3F3F] whitespace-nowrap">
                    {item.unit}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPegawai(item);
                        setShowManageModal(true);
                      }}
                      className="text-xs font-semibold text-[#4731B6] hover:underline cursor-pointer"
                    >
                      Kelola
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs sm:text-sm text-[#7E7E7E]">
                    Tidak ada data pegawai yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pegawai */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 sm:space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Tambah Data Pegawai Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 199308152020021005"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: drg. Fitria Andini"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Email Resmi Rumah Sakit</label>
                  <input
                    type="email"
                    required
                    placeholder="fitria.andini@medika.hospital"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Nomor Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formData.noTelp}
                    onChange={(e) => setFormData({ ...formData, noTelp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Jabatan</label>
                  <select
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  >
                    <option value="Dokter Umum">Dokter Umum</option>
                    <option value="Dokter Spesialis">Dokter Spesialis</option>
                    <option value="Dokter Gigi">Dokter Gigi</option>
                    <option value="Perawat">Perawat</option>
                    <option value="Bidan">Bidan</option>
                    <option value="Apoteker">Apoteker</option>
                    <option value="Analis Laboratorium">Analis Laboratorium</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Unit Kerja Penempatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Rawat Inap / IGD / Poli"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Pegawai */}
      {showManageModal && selectedPegawai && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 sm:space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Kelola Pegawai
              </h3>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 bg-[#F2F1F9] p-3.5 sm:p-4 rounded-2xl">
              <div className="font-bold text-sm sm:text-base text-[#202020]">{selectedPegawai.nama}</div>
              <div className="text-xs text-[#5F5F5F]">NIP: {selectedPegawai.nip}</div>
              <div className="text-xs text-[#5F5F5F]">Jabatan: {selectedPegawai.jabatan} · {selectedPegawai.unit}</div>
              <div className="pt-1">
                <StatusBadge status={selectedPegawai.status} />
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Edit data pegawai ${selectedPegawai.nama}`);
                  setShowManageModal(false);
                }}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-[#4731B6] text-[#4731B6] hover:bg-[#F2F1F9] font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Ubah Data Pegawai</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeletePegawai(selectedPegawai.nip)}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#FCDFD8] hover:bg-[#F9CFC5] text-[#9A2500] font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus / Nonaktifkan Pegawai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
