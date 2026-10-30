"use client";

import React, { useState } from "react";
import { Search, ChevronDown, X, History, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";

interface BandingItem {
  id: string;
  pegawai: string;
  komponen: string;
  nominal: string;
  status: string;
}

export default function AjuBandingPage() {
  const [search, setSearch] = useState("");
  const [periode, setPeriode] = useState("Mei 2025");
  const [selectedItem, setSelectedItem] = useState<BandingItem | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("Disetujui");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [bandingList, setBandingList] = useState<BandingItem[]>([
    {
      id: "BDG-25021",
      pegawai: "Ayu Lestari",
      komponen: "Tunjangan peran",
      nominal: "Rp 350.000",
      status: "Menunggu",
    },
    {
      id: "BDG-25018",
      pegawai: "Rani Oktavia",
      komponen: "Potongan absensi",
      nominal: "Rp 120.000",
      status: "Diproses",
    },
    {
      id: "BDG-25014",
      pegawai: "Dedi Kurnia",
      komponen: "Tugas tambahan",
      nominal: "Rp 275.000",
      status: "Disetujui",
    },
    {
      id: "BDG-25009",
      pegawai: "Bima Pratama",
      komponen: "Uang lembur",
      nominal: "Rp 450.000",
      status: "Disetujui",
    },
  ]);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setBandingList(
      bandingList.map((item) =>
        item.id === selectedItem.id ? { ...item, status: newStatus } : item
      )
    );
    setShowStatusModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const filtered = bandingList.filter(
    (b) =>
      b.pegawai.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.komponen.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#202020] tracking-tight">
          Aju Banding
        </h2>
        <p className="text-sm text-[#5F5F5F]">
          Kelola data dan status banding penggajian seluruh pegawai rumah sakit.
        </p>
      </div>

      {showToast && (
        <div className="p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Status pengajuan banding berhasil diperbarui!</span>
          </div>
          <button onClick={() => setShowToast(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          {/* Search Field */}
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Pencarian</span>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari data..."
                className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#202020] outline-none"
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
                <option value="April 2025">April 2025</option>
                <option value="Maret 2025">Maret 2025</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="self-end sm:self-auto sm:pt-5">
          <button
            type="button"
            onClick={() => alert("Menampilkan log riwayat keputusan banding...")}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <History className="w-4 h-4" />
            <span>Lihat log banding</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[28px] overflow-hidden shadow-xs border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#4731B6] text-white text-xs font-semibold tracking-wider">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Pegawai</th>
                <th className="py-4 px-6">Komponen</th>
                <th className="py-4 px-6">Nominal</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-4 px-6 font-mono text-[#5F5F5F]">{b.id}</td>
                  <td className="py-4 px-6 font-bold text-[#202020]">{b.pegawai}</td>
                  <td className="py-4 px-6 text-[#3F3F3F]">{b.komponen}</td>
                  <td className="py-4 px-6 font-semibold text-[#4731B6]">{b.nominal}</td>
                  <td className="py-4 px-6 text-center">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(b);
                        setNewStatus(b.status);
                        setShowStatusModal(true);
                      }}
                      className="text-xs font-semibold text-[#4731B6] hover:underline cursor-pointer"
                    >
                      Ubah status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ubah Status Banding */}
      {showStatusModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#202020]">
                Ubah Status Banding Gaji
              </h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F2F1F9] p-4 rounded-2xl space-y-1">
              <div className="text-xs text-[#5F5F5F] font-mono">{selectedItem.id}</div>
              <div className="font-bold text-base text-[#202020]">{selectedItem.pegawai}</div>
              <div className="text-xs text-[#3F3F3F]">Komponen: {selectedItem.komponen} ({selectedItem.nominal})</div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#202020]">Keputusan Status Baru</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Menunggu", "Diproses", "Disetujui", "Ditolak"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewStatus(s)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        newStatus === s
                          ? "bg-[#4731B6] text-white border-[#4731B6] shadow-xs"
                          : "bg-white text-[#3F3F3F] border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">Catatan Keputusan</label>
                <textarea
                  rows={3}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Masukkan alasan persetujuan / penolakan..."
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Simpan Keputusan
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
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
