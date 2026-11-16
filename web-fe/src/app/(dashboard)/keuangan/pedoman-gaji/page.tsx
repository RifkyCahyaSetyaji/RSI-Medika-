"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Briefcase,
  Moon,
  Clock,
  UserCheck,
  Percent,
  Calendar,
  Layers,
  Edit2,
  ChevronRight,
  Filter,
} from "lucide-react";
import { pedomanGajiService } from "@/shared/services/api/pedoman-gaji.service";
import { hrdService } from "@/shared/services/api/hrd.service";
import { PedomanGajiItem, PeranTenagaMedis } from "@/shared/types/api";

const formatRp = (val: number | string | undefined | null) => {
  const num = Number(val) || 0;
  return `Rp ${num.toLocaleString("id-ID")}`;
};

export default function PedomanGajiPage() {
  const [search, setSearch] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("Semua");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPedoman, setSelectedPedoman] = useState<PedomanGajiItem | null>(null);

  const [pedomanList, setPedomanList] = useState<PedomanGajiItem[]>([]);
  const [peranList, setPeranList] = useState<PeranTenagaMedis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    idPeran: "",
    gajiPokok: "5000000",
    tunjanganJabatan: "1000000",
    tunjanganShiftMalam: "75000",
    uangLemburPerJam: "50000",
    tunjanganKehadiranPerHari: "25000",
    persenInsentifJasaMedis: "5",
    potonganTidakHadirPerHari: "150000",
    potonganTerlambatPerKejadian: "50000",
    berlakuMulai: "2026-01-01",
    berlakuSampai: "",
    keterangan: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pedomanRes, peranRes] = await Promise.allSettled([
        pedomanGajiService.daftarPedoman(),
        hrdService.daftarPeran(),
      ]);

      if (pedomanRes.status === "fulfilled" && pedomanRes.value) {
        setPedomanList(pedomanRes.value);
      }
      if (peranRes.status === "fulfilled" && peranRes.value) {
        setPeranList(peranRes.value);
        if (peranRes.value.length > 0 && !formData.idPeran) {
          setFormData((prev) => ({ ...prev, idPeran: peranRes.value[0].idPeran }));
        }
      }
    } catch {
      // Handle error gracefully
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleOpenAdd = () => {
    setModalError(null);
    setFormData({
      idPeran: peranList[0]?.idPeran || "",
      gajiPokok: "5000000",
      tunjanganJabatan: "1000000",
      tunjanganShiftMalam: "75000",
      uangLemburPerJam: "50000",
      tunjanganKehadiranPerHari: "25000",
      persenInsentifJasaMedis: "5",
      potonganTidakHadirPerHari: "150000",
      potonganTerlambatPerKejadian: "50000",
      berlakuMulai: new Date().toISOString().split("T")[0],
      berlakuSampai: "",
      keterangan: "",
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: PedomanGajiItem) => {
    setSelectedPedoman(p);
    setModalError(null);
    setFormData({
      idPeran: p.idPeran,
      gajiPokok: String(p.gajiPokok || 0),
      tunjanganJabatan: String(p.tunjanganJabatan || 0),
      tunjanganShiftMalam: String(p.tunjanganShiftMalam || 0),
      uangLemburPerJam: String(p.uangLemburPerJam || 0),
      tunjanganKehadiranPerHari: String(p.tunjanganKehadiranPerHari || 0),
      persenInsentifJasaMedis: String(p.persenInsentifJasaMedis || 0),
      potonganTidakHadirPerHari: String(p.potonganTidakHadirPerHari || 0),
      potonganTerlambatPerKejadian: String(p.potonganTerlambatPerKejadian || 0),
      berlakuMulai: p.berlakuMulai ? String(p.berlakuMulai).split("T")[0] : "2026-01-01",
      berlakuSampai: p.berlakuSampai ? String(p.berlakuSampai).split("T")[0] : "",
      keterangan: p.keterangan || "",
    });
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        idPeran: formData.idPeran,
        gajiPokok: Number(formData.gajiPokok),
        tunjanganJabatan: Number(formData.tunjanganJabatan),
        tunjanganShiftMalam: Number(formData.tunjanganShiftMalam),
        uangLemburPerJam: Number(formData.uangLemburPerJam),
        tunjanganKehadiranPerHari: Number(formData.tunjanganKehadiranPerHari),
        persenInsentifJasaMedis: Number(formData.persenInsentifJasaMedis),
        potonganTidakHadirPerHari: Number(formData.potonganTidakHadirPerHari),
        potonganTerlambatPerKejadian: Number(formData.potonganTerlambatPerKejadian),
        berlakuMulai: formData.berlakuMulai,
        berlakuSampai: formData.berlakuSampai || null,
        keterangan: formData.keterangan || `Pedoman standar peran`,
      };

      await pedomanGajiService.buatPedoman(payload);
      setShowAddModal(false);
      triggerToast("Pedoman gaji baru berhasil ditambahkan!");
      loadData();
    } catch (err: any) {
      setModalError(err?.message || "Gagal menyimpan pedoman gaji.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPedoman) return;
    setIsSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        idPeran: formData.idPeran,
        gajiPokok: Number(formData.gajiPokok),
        tunjanganJabatan: Number(formData.tunjanganJabatan),
        tunjanganShiftMalam: Number(formData.tunjanganShiftMalam),
        uangLemburPerJam: Number(formData.uangLemburPerJam),
        tunjanganKehadiranPerHari: Number(formData.tunjanganKehadiranPerHari),
        persenInsentifJasaMedis: Number(formData.persenInsentifJasaMedis),
        potonganTidakHadirPerHari: Number(formData.potonganTidakHadirPerHari),
        potonganTerlambatPerKejadian: Number(formData.potonganTerlambatPerKejadian),
        berlakuMulai: formData.berlakuMulai,
        berlakuSampai: formData.berlakuSampai || null,
        keterangan: formData.keterangan,
      };

      await pedomanGajiService.ubahPedoman(selectedPedoman.idPedoman, payload);
      setShowEditModal(false);
      triggerToast("Pedoman gaji berhasil diperbarui!");
      loadData();
    } catch (err: any) {
      setModalError(err?.message || "Gagal memperbarui pedoman gaji.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = pedomanList.filter((item) => {
    const namaPeran = item.peran_tenaga_medis?.namaPeran || "";
    const kategori = item.peran_tenaga_medis?.kategori || "Umum";
    const ket = item.keterangan || "";

    const matchSearch =
      namaPeran.toLowerCase().includes(search.toLowerCase()) ||
      kategori.toLowerCase().includes(search.toLowerCase()) ||
      ket.toLowerCase().includes(search.toLowerCase());

    const matchKategori =
      selectedKategori === "Semua" || kategori.toLowerCase() === selectedKategori.toLowerCase();

    return matchSearch && matchKategori;
  });

  const categories = ["Semua", "Medis", "Keperawatan", "Kebidanan", "Kefarmasian", "Penunjang Medis"];

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#202020] tracking-tight">
          Pedoman Gaji
        </h2>
        <p className="text-xs sm:text-sm text-[#5F5F5F]">
          Kelola data dan pedoman ketentuan standar penggajian tenaga medis serta staf rumah sakit.
        </p>
      </div>

      {/* Global Toast */}
      {showToast && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in ${
            toastType === "error"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-[#D8F0D3] border-[#0E6100]/20 text-[#0E6100]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastType === "error" ? (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setShowToast(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-1 max-w-xl">
          <div className="flex-1 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Cari Pedoman</span>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama peran medis atau keterangan..."
                className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] focus:ring-1 focus:ring-[#4731B6] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#202020] outline-none"
              />
            </div>
          </div>

          <div className="w-full sm:w-48 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Kategori Peran</span>
            <div className="relative">
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="w-full appearance-none bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-[#202020] outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah pedoman</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#4731B6]" />
          <p className="text-sm font-medium">Memuat data pedoman gaji...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-700">Tidak ada pedoman gaji yang ditemukan</p>
          <p className="text-xs text-gray-400 mt-1">Coba gunakan kata kunci lain atau tambahkan pedoman baru.</p>
        </div>
      ) : (
        /* Grid of Pedoman Cards (Clean Figma Style) */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.idPedoman}
              className="bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-4">
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#EBE9F8] text-[#4731B6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#202020] leading-snug">
                        {item.peran_tenaga_medis?.namaPeran || "Tenaga Medis"}
                      </h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium text-gray-600">
                        {item.peran_tenaga_medis?.kategori || "Umum"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#7E7E7E] leading-relaxed line-clamp-2 min-h-[32px]">
                  {item.keterangan || `Ketentuan penggajian resmi untuk peran ${item.peran_tenaga_medis?.namaPeran}.`}
                </p>

                {/* Komponen Ringkasan */}
                <div className="bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#ECEAF8] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F5F5F] flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#4731B6]" />
                      Gaji Pokok
                    </span>
                    <span className="font-bold text-[#202020]">{formatRp(item.gajiPokok)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F5F5F] flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#4731B6]" />
                      Tunj. Jabatan
                    </span>
                    <span className="font-semibold text-[#202020]">{formatRp(item.tunjanganJabatan)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F5F5F] flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      Shift Malam
                    </span>
                    <span className="font-semibold text-gray-700">{formatRp(item.tunjanganShiftMalam)}/shift</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F5F5F] flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-600" />
                      Insentif Jasa Medis
                    </span>
                    <span className="font-bold text-emerald-700">{Number(item.persenInsentifJasaMedis)}%</span>
                  </div>
                </div>

                {/* Potongan & Lembur Info */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#7E7E7E]">
                  <div>
                    <span>Lembur: </span>
                    <span className="font-semibold text-gray-800">{formatRp(item.uangLemburPerJam)}/jam</span>
                  </div>
                  <div>
                    <span>Pot. Alpa: </span>
                    <span className="font-semibold text-rose-600">{formatRp(item.potonganTidakHadirPerHari)}/hari</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#4731B6] text-[#4731B6] hover:bg-[#F2F1F9] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Kelola pedoman</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Pedoman Gaji */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 shadow-2xl border border-gray-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#4731B6]" />
                <span>Tambah Pedoman Gaji Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <div className="flex-1 font-medium">{modalError}</div>
                <button type="button" onClick={() => setModalError(null)} className="cursor-pointer text-rose-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Peran Tenaga Medis</label>
                <select
                  required
                  value={formData.idPeran}
                  onChange={(e) => setFormData({ ...formData, idPeran: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                >
                  {peranList.map((prn) => (
                    <option key={prn.idPeran} value={prn.idPeran}>
                      {prn.namaPeran} ({prn.kategori})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.gajiPokok}
                    onChange={(e) => setFormData({ ...formData, gajiPokok: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Tunjangan Jabatan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.tunjanganJabatan}
                    onChange={(e) => setFormData({ ...formData, tunjanganJabatan: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Tunj. Shift Malam (/shift)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tunjanganShiftMalam}
                    onChange={(e) => setFormData({ ...formData, tunjanganShiftMalam: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Uang Lembur (/jam)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.uangLemburPerJam}
                    onChange={(e) => setFormData({ ...formData, uangLemburPerJam: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Insentif Jasa Medis (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.persenInsentifJasaMedis}
                    onChange={(e) => setFormData({ ...formData, persenInsentifJasaMedis: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Tunj. Kehadiran (/hari)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tunjanganKehadiranPerHari}
                    onChange={(e) => setFormData({ ...formData, tunjanganKehadiranPerHari: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Potongan Alpa (/hari)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.potonganTidakHadirPerHari}
                    onChange={(e) => setFormData({ ...formData, potonganTidakHadirPerHari: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Potongan Terlambat (/kali)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.potonganTerlambatPerKejadian}
                    onChange={(e) => setFormData({ ...formData, potonganTerlambatPerKejadian: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Berlaku Mulai</label>
                  <input
                    type="date"
                    required
                    value={formData.berlakuMulai}
                    onChange={(e) => setFormData({ ...formData, berlakuMulai: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Berlaku Sampai (Opsional)</label>
                  <input
                    type="date"
                    value={formData.berlakuSampai}
                    onChange={(e) => setFormData({ ...formData, berlakuSampai: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Keterangan Pedoman</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: SK Direksi No. 10/2026 tentang Standardisasi Gaji Dokter"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Pedoman</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola / Ubah Pedoman Gaji */}
      {showEditModal && selectedPedoman && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 shadow-2xl border border-gray-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#4731B6]" />
                <span>Kelola Pedoman: {selectedPedoman.peran_tenaga_medis?.namaPeran}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <div className="flex-1 font-medium">{modalError}</div>
                <button type="button" onClick={() => setModalError(null)} className="cursor-pointer text-rose-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Peran Tenaga Medis</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedPedoman.peran_tenaga_medis?.namaPeran} (${selectedPedoman.peran_tenaga_medis?.kategori})`}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.gajiPokok}
                    onChange={(e) => setFormData({ ...formData, gajiPokok: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Tunjangan Jabatan (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.tunjanganJabatan}
                    onChange={(e) => setFormData({ ...formData, tunjanganJabatan: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Tunj. Shift Malam (/shift)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tunjanganShiftMalam}
                    onChange={(e) => setFormData({ ...formData, tunjanganShiftMalam: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Uang Lembur (/jam)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.uangLemburPerJam}
                    onChange={(e) => setFormData({ ...formData, uangLemburPerJam: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Insentif Jasa Medis (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.persenInsentifJasaMedis}
                    onChange={(e) => setFormData({ ...formData, persenInsentifJasaMedis: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Tunj. Kehadiran (/hari)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tunjanganKehadiranPerHari}
                    onChange={(e) => setFormData({ ...formData, tunjanganKehadiranPerHari: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Potongan Alpa (/hari)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.potonganTidakHadirPerHari}
                    onChange={(e) => setFormData({ ...formData, potonganTidakHadirPerHari: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Potongan Terlambat (/kali)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.potonganTerlambatPerKejadian}
                    onChange={(e) => setFormData({ ...formData, potonganTerlambatPerKejadian: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Berlaku Mulai</label>
                  <input
                    type="date"
                    required
                    value={formData.berlakuMulai}
                    onChange={(e) => setFormData({ ...formData, berlakuMulai: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Berlaku Sampai (Opsional)</label>
                  <input
                    type="date"
                    value={formData.berlakuSampai}
                    onChange={(e) => setFormData({ ...formData, berlakuSampai: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Keterangan Kebijakan</label>
                <textarea
                  rows={2}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
