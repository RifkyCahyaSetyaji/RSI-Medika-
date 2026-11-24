"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
} from "lucide-react";
import { StatusBadge } from "@/shared/components/ui/status-badge";
import { Pagination } from "@/shared/components/ui/pagination";
import { hrdService } from "@/shared/services/api/hrd.service";
import { Pegawai, PeranTenagaMedis } from "@/shared/types/api";

interface PegawaiItem {
  idPegawai?: string;
  nip: string;
  nama: string;
  jabatan: string;
  unit: string;
  status: string;
  email?: string;
  noTelp?: string;
  alamat?: string;
  sisaJatahCuti?: number;
  idPeran?: string | null;
  idPeranList?: string[];
  peranListNama?: string[];
}

export default function KepegawaianPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pegawaiList, setPegawaiList] = useState<PegawaiItem[]>([]);

  const [masterPeran, setMasterPeran] = useState<PeranTenagaMedis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form Tambah Pegawai state
  const [formData, setFormData] = useState({
    nip: "",
    nama: "",
    email: "",
    noTelp: "",
    alamat: "",
    jabatan: "Perawat",
    unit: "Rawat Inap",
    statusPegawai: "Aktif",
    tanggalMasuk: new Date().toISOString().split("T")[0],
    sisaJatahCuti: 12,
    idPeran: "",
    idPeranList: [] as string[],
  });

  // Form Ubah Pegawai state
  const [editFormData, setEditFormData] = useState({
    idPegawai: "",
    nip: "",
    nama: "",
    email: "",
    noTelp: "",
    alamat: "",
    jabatan: "Perawat",
    unit: "Rawat Inap",
    statusPegawai: "Aktif",
    sisaJatahCuti: 12,
    idPeran: "",
    idPeranList: [] as string[],
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [peranRes, pegawaiRes] = await Promise.allSettled([
        hrdService.daftarPeran(),
        hrdService.daftarPegawai(),
      ]);

      if (peranRes.status === "fulfilled" && peranRes.value) {
        setMasterPeran(peranRes.value);
      }

      if (pegawaiRes.status === "fulfilled" && pegawaiRes.value && pegawaiRes.value.length > 0) {
        const mappedFromApi: PegawaiItem[] = pegawaiRes.value.map((p) => {
          const perans = p.pegawai_peran && p.pegawai_peran.length > 0
            ? p.pegawai_peran.map((pp) => pp.idPeran)
            : (p.idPeran ? [p.idPeran] : []);

          const peransNama = p.pegawai_peran && p.pegawai_peran.length > 0
            ? p.pegawai_peran.map((pp) => pp.peran_tenaga_medis?.namaPeran || pp.idPeran)
            : (p.peran_tenaga_medis ? [p.peran_tenaga_medis.namaPeran] : []);

          return {
            idPegawai: p.idPegawai,
            nip: p.nip,
            nama: p.nama,
            jabatan: p.jabatan,
            unit: p.unitKerja,
            status: p.statusPegawai || "Aktif",
            email: p.email,
            noTelp: p.noTelp || "-",
            alamat: p.alamat || "",
            sisaJatahCuti: p.sisaJatahCuti ?? 12,
            idPeran: p.idPeran,
            idPeranList: perans,
            peranListNama: peransNama,
          };
        });
        setPegawaiList(mappedFromApi);
      } else {
        setPegawaiList([]);
      }
    } catch {
      setPegawaiList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    try {
      const perans = formData.idPeranList.length > 0
        ? formData.idPeranList
        : (formData.idPeran ? [formData.idPeran] : []);

      const res = await hrdService.tambahPegawai({
        nama: formData.nama,
        nip: formData.nip,
        email: formData.email,
        noTelp: formData.noTelp,
        alamat: formData.alamat,
        jabatan: formData.jabatan,
        unitKerja: formData.unit,
        statusPegawai: formData.statusPegawai,
        tanggalMasuk: formData.tanggalMasuk,
        sisaJatahCuti: Number(formData.sisaJatahCuti) || 12,
        idPeran: perans[0] || null,
        idPeranList: perans,
      });

      const peransNama = perans
        .map((pid) => masterPeran.find((m) => m.idPeran === pid)?.namaPeran || pid);

      const created: PegawaiItem = {
        idPegawai: res?.idPegawai || `PGW-${Date.now()}`,
        nip: formData.nip,
        nama: formData.nama,
        jabatan: formData.jabatan,
        unit: formData.unit,
        status: formData.statusPegawai,
        email: formData.email,
        noTelp: formData.noTelp,
        alamat: formData.alamat,
        sisaJatahCuti: Number(formData.sisaJatahCuti) || 12,
        idPeran: perans[0] || null,
        idPeranList: perans,
        peranListNama: peransNama,
      };
      setPegawaiList((prev) => [created, ...prev]);
      setShowAddModal(false);
      setModalError(null);
      setToastType("success");
      setToastMsg(`Pegawai baru "${formData.nama}" berhasil ditambahkan!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
      setFormData({
        nip: "",
        nama: "",
        email: "",
        noTelp: "",
        alamat: "",
        jabatan: "Perawat",
        unit: "Rawat Inap",
        statusPegawai: "Aktif",
        tanggalMasuk: new Date().toISOString().split("T")[0],
        sisaJatahCuti: 12,
        idPeran: "",
        idPeranList: [],
      });
    } catch (err: any) {
      const errorText = err?.message || "Gagal menambahkan data pegawai.";
      setModalError(errorText);
      setToastType("error");
      setToastMsg(errorText);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item: PegawaiItem) => {
    setSelectedPegawai(item);
    setModalError(null);
    const perans = item.idPeranList && item.idPeranList.length > 0
      ? item.idPeranList
      : (item.idPeran ? [item.idPeran] : []);

    setEditFormData({
      idPegawai: item.idPegawai || item.nip,
      nip: item.nip,
      nama: item.nama,
      email: item.email || "",
      noTelp: item.noTelp || "",
      alamat: item.alamat || "",
      jabatan: item.jabatan,
      unit: item.unit,
      statusPegawai: item.status,
      sisaJatahCuti: item.sisaJatahCuti ?? 12,
      idPeran: perans[0] || "",
      idPeranList: perans,
    });
    setShowManageModal(false);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    const targetId = editFormData.idPegawai || editFormData.nip;

    const perans = editFormData.idPeranList.length > 0
      ? editFormData.idPeranList
      : (editFormData.idPeran ? [editFormData.idPeran] : []);

    try {
      await hrdService.ubahPegawai(targetId, {
        nama: editFormData.nama,
        nip: editFormData.nip,
        email: editFormData.email,
        noTelp: editFormData.noTelp,
        alamat: editFormData.alamat,
        jabatan: editFormData.jabatan,
        unitKerja: editFormData.unit,
        statusPegawai: editFormData.statusPegawai,
        sisaJatahCuti: Number(editFormData.sisaJatahCuti) || 12,
        idPeran: perans[0] || null,
        idPeranList: perans,
      });

      const peransNama = perans
        .map((pid) => masterPeran.find((m) => m.idPeran === pid)?.namaPeran || pid);

      setPegawaiList((prev) =>
        prev.map((item) =>
          item.nip === selectedPegawai?.nip || item.idPegawai === targetId
            ? {
                ...item,
                nip: editFormData.nip,
                nama: editFormData.nama,
                email: editFormData.email,
                noTelp: editFormData.noTelp,
                alamat: editFormData.alamat,
                jabatan: editFormData.jabatan,
                unit: editFormData.unit,
                status: editFormData.statusPegawai,
                sisaJatahCuti: Number(editFormData.sisaJatahCuti) || 12,
                idPeran: perans[0] || null,
                idPeranList: perans,
                peranListNama: peransNama,
              }
            : item
        )
      );

      setShowEditModal(false);
      setModalError(null);
      setToastType("success");
      setToastMsg(`Data pegawai "${editFormData.nama}" berhasil diperbarui!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err: any) {
      const errorText = err?.message || "Gagal memperbarui data pegawai.";
      setModalError(errorText);
      setToastType("error");
      setToastMsg(errorText);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePegawai = async (nip: string) => {
    if (confirm("Apakah Anda yakin ingin menonaktifkan / menghapus data pegawai ini?")) {
      const target = pegawaiList.find((p) => p.nip === nip);
      try {
        if (target?.idPegawai) {
          await hrdService.hapusPegawai(target.idPegawai);
        }
      } catch {
        // Fallback local
      }
      setPegawaiList((prev) => prev.filter((p) => p.nip !== nip));
      setShowManageModal(false);
      setToastMsg(`Data pegawai "${target?.nama || nip}" berhasil dihapus / dinonaktifkan.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }
  };

  const filtered = pegawaiList.filter((p) => {
    const matchesSearch =
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.nip.includes(search) ||
      p.jabatan.toLowerCase().includes(search.toLowerCase()) ||
      p.unit.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "Semua" || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202020] tracking-tight">
          Kepegawaian
        </h2>
        <p className="text-xs sm:text-sm text-[#5F5F5F]">
          Kelola data, ubah profil jabatan, peran tenaga medis, dan status seluruh staf rumah sakit.
        </p>
      </div>

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
              <X className="w-5 h-5 shrink-0 text-rose-600" />
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari data nama, NIP, atau unit..."
                className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] focus:ring-1 focus:ring-[#4731B6] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[#202020] outline-none"
              />
            </div>
          </div>

          {/* Filter Status Pegawai */}
          <div className="w-full sm:w-44 space-y-1">
            <span className="text-xs font-semibold text-[#202020] block">Status Pegawai</span>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-white border border-[#D8D8D8] focus:border-[#4731B6] rounded-xl py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-[#202020] outline-none cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Diproses">Diproses</option>
                <option value="Nonaktif">Nonaktif</option>
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
      <div className="bg-white rounded-xl shadow-xs border border-gray-200/90 overflow-hidden space-y-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px] sm:min-w-full">
            <thead>
              <tr className="bg-[#4731B6] text-white text-xs font-semibold tracking-wider">
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">NIP</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Nama Pegawai</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Jabatan</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 whitespace-nowrap">Unit Kerja</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {paginated.map((item, index) => (
                <tr key={item.idPegawai ? `${item.idPegawai}-${item.nip}` : `${item.nip}-${index}`} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-mono text-[#5F5F5F] whitespace-nowrap">
                    {item.nip}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 font-bold text-[#202020] whitespace-nowrap">
                    <div>{item.nama}</div>
                    {item.email && (
                      <div className="text-[11px] font-normal text-[#7E7E7E]">{item.email}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-[#3F3F3F] whitespace-nowrap">
                    <div>{item.jabatan}</div>
                    {item.peranListNama && item.peranListNama.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.peranListNama.map((pName, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E8E5FA] text-[#4731B6]"
                          >
                            {pName}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-[#3F3F3F] whitespace-nowrap">
                    {item.unit}
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 sm:py-4 sm:px-6 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="py-1 px-2.5 rounded-lg bg-[#EBE9F8] hover:bg-[#DDD9F5] text-[#4731B6] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Ubah Data Pegawai"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Ubah</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPegawai(item);
                          setShowManageModal(true);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#5F5F5F] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                    </div>
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

      {/* Modal Tambah Pegawai */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 sm:space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#4731B6]" />
                <span>Tambah Data Pegawai Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setModalError(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <div className="flex-1 font-medium leading-relaxed">{modalError}</div>
                <button
                  type="button"
                  onClick={() => setModalError(null)}
                  className="cursor-pointer text-rose-500 hover:text-rose-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

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
                    placeholder="081234567890"
                    value={formData.noTelp}
                    onChange={(e) => setFormData({ ...formData, noTelp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Alamat Tinggal</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Diponegoro No. 12, Surabaya"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Jabatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Perawat Pelaksana / Dokter Umum"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Unit Kerja Penempatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rawat Inap / IGD / ICU / Poli"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Status Pegawai</label>
                  <select
                    value={formData.statusPegawai}
                    onChange={(e) => setFormData({ ...formData, statusPegawai: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Sisa Hak Cuti (Hari)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.sisaJatahCuti}
                    onChange={(e) => setFormData({ ...formData, sisaJatahCuti: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              {/* Peran Tenaga Medis (Lebar Penuh) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#202020] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#4731B6]" />
                    <span>Peran Tenaga Medis (Bisa pilih lebih dari satu)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#4731B6] bg-[#F2F1F9] px-2.5 py-0.5 rounded-full border border-[#E0DCF8]">
                    {formData.idPeranList.length} peran dipilih
                  </span>
                </div>
                <p className="text-[11px] text-[#7E7E7E]">
                  Centang satu atau lebih peran fungsional klinis untuk pegawai ini:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-3.5 bg-[#F8F7FD] rounded-2xl max-h-52 overflow-y-auto border border-[#E0DCF8] shadow-inner">
                  {masterPeran.map((p) => {
                    const isChecked = formData.idPeranList.includes(p.idPeran);
                    return (
                      <label
                        key={p.idPeran}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs cursor-pointer border transition-all select-none ${
                          isChecked
                            ? "bg-white border-[#4731B6] text-[#4731B6] font-semibold shadow-xs ring-1 ring-[#4731B6]"
                            : "bg-white/80 border-gray-200 text-[#3F3F3F] hover:bg-white hover:border-[#8D7BE4]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((prev) => ({
                                ...prev,
                                idPeranList: [...prev.idPeranList, p.idPeran],
                                idPeran: prev.idPeran || p.idPeran,
                              }));
                            } else {
                              setFormData((prev) => {
                                const nextList = prev.idPeranList.filter((id) => id !== p.idPeran);
                                return {
                                  ...prev,
                                  idPeranList: nextList,
                                  idPeran: nextList[0] || "",
                                };
                              });
                            }
                          }}
                          className="w-4 h-4 text-[#4731B6] rounded accent-[#4731B6] mt-0.5 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate leading-tight font-medium">{p.namaPeran}</span>
                          {p.kategori && (
                            <span className="text-[10px] text-[#7E7E7E] font-normal truncate mt-0.5">
                              {p.kategori}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
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
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Pegawai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Pegawai (UBAH DATA PEGAWAI) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 sm:space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#4731B6]" />
                <span>Ubah Data Pegawai</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setModalError(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <div className="flex-1 font-medium leading-relaxed">{modalError}</div>
                <button
                  type="button"
                  onClick={() => setModalError(null)}
                  className="cursor-pointer text-rose-500 hover:text-rose-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nip}
                    onChange={(e) => setEditFormData({ ...editFormData, nip: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nama}
                    onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
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
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Nomor Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    value={editFormData.noTelp}
                    onChange={(e) => setEditFormData({ ...editFormData, noTelp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#202020]">Alamat Tinggal</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Diponegoro No. 12, Surabaya"
                  value={editFormData.alamat}
                  onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Jabatan</label>
                  <input
                    type="text"
                    required
                    value={editFormData.jabatan}
                    onChange={(e) => setEditFormData({ ...editFormData, jabatan: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Unit Kerja Penempatan</label>
                  <input
                    type="text"
                    required
                    value={editFormData.unit}
                    onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Status Pegawai</label>
                  <select
                    value={editFormData.statusPegawai}
                    onChange={(e) => setEditFormData({ ...editFormData, statusPegawai: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none font-semibold text-[#4731B6]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#202020]">Sisa Hak Cuti (Hari)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={editFormData.sisaJatahCuti}
                    onChange={(e) => setEditFormData({ ...editFormData, sisaJatahCuti: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                  />
                </div>
              </div>

              {/* Peran Tenaga Medis (Lebar Penuh) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#202020] flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#4731B6]" />
                    <span>Peran Tenaga Medis (Bisa pilih lebih dari satu)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-[#4731B6] bg-[#F2F1F9] px-2.5 py-0.5 rounded-full border border-[#E0DCF8]">
                    {editFormData.idPeranList.length} peran dipilih
                  </span>
                </div>
                <p className="text-[11px] text-[#7E7E7E]">
                  Centang satu atau lebih peran fungsional klinis untuk pegawai ini:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-3.5 bg-[#F8F7FD] rounded-2xl max-h-52 overflow-y-auto border border-[#E0DCF8] shadow-inner">
                  {masterPeran.map((p) => {
                    const isChecked = editFormData.idPeranList.includes(p.idPeran);
                    return (
                      <label
                        key={p.idPeran}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs cursor-pointer border transition-all select-none ${
                          isChecked
                            ? "bg-white border-[#4731B6] text-[#4731B6] font-semibold shadow-xs ring-1 ring-[#4731B6]"
                            : "bg-white/80 border-gray-200 text-[#3F3F3F] hover:bg-white hover:border-[#8D7BE4]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditFormData((prev) => ({
                                ...prev,
                                idPeranList: [...prev.idPeranList, p.idPeran],
                                idPeran: prev.idPeran || p.idPeran,
                              }));
                            } else {
                              setEditFormData((prev) => {
                                const nextList = prev.idPeranList.filter((id) => id !== p.idPeran);
                                return {
                                  ...prev,
                                  idPeranList: nextList,
                                  idPeran: nextList[0] || "",
                                };
                              });
                            }
                          }}
                          className="w-4 h-4 text-[#4731B6] rounded accent-[#4731B6] mt-0.5 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate leading-tight font-medium">{p.namaPeran}</span>
                          {p.kategori && (
                            <span className="text-[10px] text-[#7E7E7E] font-normal truncate mt-0.5">
                              {p.kategori}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Perubahan Pegawai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Pegawai / Detail */}
      {showManageModal && selectedPegawai && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-8 shadow-2xl border border-gray-100 space-y-5 sm:space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base sm:text-lg text-[#202020]">
                Detail & Kelola Pegawai
              </h3>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[#F2F1F9] p-4 rounded-2xl">
              <div>
                <div className="font-bold text-base text-[#202020]">{selectedPegawai.nama}</div>
                <div className="text-xs font-mono text-[#5F5F5F] mt-0.5">NIP: {selectedPegawai.nip}</div>
              </div>

              <div className="text-xs space-y-1 text-[#3F3F3F] pt-2 border-t border-[#D8D4F0]">
                <div>
                  <strong>Jabatan:</strong> {selectedPegawai.jabatan}
                </div>
                <div>
                  <strong>Unit Kerja:</strong> {selectedPegawai.unit}
                </div>
                {selectedPegawai.email && (
                  <div>
                    <strong>Email:</strong> {selectedPegawai.email}
                  </div>
                )}
                {selectedPegawai.noTelp && (
                  <div>
                    <strong>No. Telp:</strong> {selectedPegawai.noTelp}
                  </div>
                )}
                {selectedPegawai.alamat && (
                  <div>
                    <strong>Alamat:</strong> {selectedPegawai.alamat}
                  </div>
                )}
                <div>
                  <strong>Sisa Cuti:</strong> {selectedPegawai.sisaJatahCuti ?? 12} Hari
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#5F5F5F]">Status saat ini:</span>
                <StatusBadge status={selectedPegawai.status} />
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3 pt-2">
              <button
                type="button"
                onClick={() => openEditModal(selectedPegawai)}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
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
