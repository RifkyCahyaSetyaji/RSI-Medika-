"use client";

import React, { useState } from "react";
import { Search, Plus, FileText, X, CheckCircle2, ShieldCheck } from "lucide-react";

interface PedomanItem {
  id: string;
  title: string;
  description: string;
  nominalText: string;
  peran: string;
}

export default function PedomanGajiPage() {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedPedoman, setSelectedPedoman] = useState<PedomanItem | null>(null);
  const [showToast, setShowToast] = useState(false);

  // New pedoman form state
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("Semua Tenaga Medis");
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const [pedomanList, setPedomanList] = useState<PedomanItem[]>([
    {
      id: "1",
      title: "Gaji Pokok",
      description: "Ketentuan gaji pokok berdasarkan golongan dan masa kerja.",
      nominalText: "Rp 5.250.000 / bulan (Grade A)",
      peran: "Dokter & Tenaga Medis",
    },
    {
      id: "2",
      title: "Tunjangan Peran",
      description: "Perhitungan tunjangan jabatan dan tanggung jawab.",
      nominalText: "Rp 1.250.000 / bulan",
      peran: "Perawat Pelaksana & Bidan",
    },
    {
      id: "3",
      title: "Tugas Tambahan",
      description: "Nominal tugas tambahan dan jam kerja khusus.",
      nominalText: "Rp 85.000 / jam lembur",
      peran: "Semua Tenaga Medis",
    },
    {
      id: "4",
      title: "Potongan Absensi",
      description: "Aturan potongan keterlambatan dan ketidakhadiran.",
      nominalText: "Rp 150.000 / hari alpa",
      peran: "Seluruh Pegawai",
    },
    {
      id: "5",
      title: "Tunjangan Shift Malam",
      description: "Insentif per shift malam bagi tenaga medis rawat inap & IGD.",
      nominalText: "Rp 120.000 / shift",
      peran: "Perawat & Dokter Jaga",
    },
    {
      id: "6",
      title: "Insentif Jasa Medis",
      description: "Persentase nilai tindakan medis dan konsultasi spesialis.",
      nominalText: "25% dari jasa tindakan",
      peran: "Dokter Spesialis & Gigi",
    },
  ]);

  const handleCreatePedoman = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: PedomanItem = {
      id: String(Date.now()),
      title: formName,
      description: formDesc,
      nominalText: formAmount,
      peran: formRole,
    };
    setPedomanList([newItem, ...pedomanList]);
    setShowAddModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const filtered = pedomanList.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#202020] tracking-tight">
          Pedoman Gaji
        </h2>
        <p className="text-sm text-[#5F5F5F]">
          Kelola data dan pedoman ketentuan penggajian tenaga medis serta staf rumah sakit.
        </p>
      </div>

      {showToast && (
        <div className="p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Pedoman baru berhasil disimpan dan diberlakukan untuk periode berjalan!</span>
          </div>
          <button onClick={() => setShowToast(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="w-full sm:max-w-md space-y-1">
          <span className="text-xs font-semibold text-[#202020] block">Cari pedoman</span>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul atau komponen..."
              className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#202020] outline-none"
            />
          </div>
        </div>

        <div className="self-end sm:self-auto sm:pt-5">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah pedoman</span>
          </button>
        </div>
      </div>

      {/* Grid of Pedoman Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-[28px] p-6 shadow-xs border border-black/5 flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBE9F8] text-[#4731B6] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#7E7E7E] leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-[#7E7E7E] block">Besaran / Tarif:</span>
                <span className="text-xs font-bold text-[#4731B6]">{item.nominalText}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedPedoman(item);
                setShowManageModal(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-[#4731B6] text-[#4731B6] hover:bg-[#F2F1F9] font-semibold text-xs transition-colors cursor-pointer text-center"
            >
              Kelola pedoman
            </button>
          </div>
        ))}
      </div>

      {/* Modal Tambah Pedoman Gaji (Figma #240:6822) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#202020]">
                Tambah Pedoman Gaji Baru
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePedoman} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Nama Komponen Pedoman</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tunjangan Hari Raya / Insentif IGD"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Berlaku untuk Peran</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                >
                  <option value="Semua Tenaga Medis">Semua Tenaga Medis</option>
                  <option value="Dokter Spesialis">Dokter Spesialis</option>
                  <option value="Dokter Umum">Dokter Umum</option>
                  <option value="Perawat">Perawat</option>
                  <option value="Bidan">Bidan</option>
                  <option value="Apoteker">Apoteker</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Besaran Nominal / Rumus (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rp 1.500.000 / bulan atau 20%"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Keterangan & Dasar Kebijakan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan dasar aturan permenkes / SK direksi rumah sakit..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Simpan Pedoman
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Pedoman */}
      {showManageModal && selectedPedoman && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#202020]">
                Rincian Pedoman Gaji
              </h3>
              <button onClick={() => setShowManageModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F2F1F9] p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#4731B6]">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold text-base">{selectedPedoman.title}</span>
              </div>
              <p className="text-xs text-[#5F5F5F] leading-relaxed">{selectedPedoman.description}</p>
              <div className="pt-2 text-xs">
                <span className="text-[#7E7E7E]">Besaran tarif saat ini: </span>
                <span className="font-bold text-[#202020]">{selectedPedoman.nominalText}</span>
              </div>
              <div className="text-xs">
                <span className="text-[#7E7E7E]">Target peran: </span>
                <span className="font-medium text-[#202020]">{selectedPedoman.peran}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert("Simulasi penyesuaian tarif pedoman disimpan.");
                  setShowManageModal(false);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Ubah Besaran Tarif
              </button>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
