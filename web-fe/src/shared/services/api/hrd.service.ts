import { apiClient } from "./api-client";
import { Pegawai, PeranTenagaMedis } from "@/shared/types/api";

export const hrdService = {
  // Pegawai CRUD
  daftarPegawai: async (params?: { search?: string; unit?: string; status?: string }) => {
    const res = await apiClient.get<Pegawai[]>("/hrd/pegawai", { params });
    return res.data;
  },

  detailPegawai: async (idPegawai: string) => {
    const res = await apiClient.get<Pegawai>(`/hrd/pegawai/${idPegawai}`);
    return res.data;
  },

  tambahPegawai: async (data: {
    nama: string;
    nip: string;
    email: string;
    noTelp?: string;
    alamat?: string;
    jabatan: string;
    unitKerja: string;
    statusPegawai?: string;
    tanggalMasuk?: string;
    sisaJatahCuti?: number;
    idPeran?: string | null;
  }) => {
    const res = await apiClient.post<Pegawai>("/hrd/pegawai", data);
    return res.data;
  },

  ubahPegawai: async (
    idPegawai: string,
    data: {
      nama?: string;
      nip?: string;
      email?: string;
      noTelp?: string;
      alamat?: string;
      jabatan?: string;
      unitKerja?: string;
      statusPegawai?: string;
      tanggalMasuk?: string;
      sisaJatahCuti?: number;
      idPeran?: string | null;
    }
  ) => {
    const res = await apiClient.patch<Pegawai>(`/hrd/pegawai/${idPegawai}`, data);
    return res.data;
  },

  hapusPegawai: async (idPegawai: string) => {
    const res = await apiClient.delete<{ message: string }>(`/hrd/pegawai/${idPegawai}`);
    return res.data;
  },

  // Akun Pegawai
  pegawaiTanpaAkun: async () => {
    const res = await apiClient.get<Pegawai[]>("/hrd/pegawai-tanpa-akun");
    return res.data;
  },

  buatAkun: async (data: {
    idPegawai: string;
    username: string;
    role: string;
    password?: string;
  }) => {
    const res = await apiClient.post("/hrd/akun", data);
    return res.data;
  },

  // Peran Tenaga Medis
  daftarPeran: async () => {
    const res = await apiClient.get<PeranTenagaMedis[]>("/hrd/peran");
    return res.data;
  },

  tambahPeran: async (data: { namaPeran: string; kategori: string; deskripsi?: string }) => {
    const res = await apiClient.post<PeranTenagaMedis>("/hrd/peran", data);
    return res.data;
  },

  ubahPeranPegawai: async (idPegawai: string, idPeran: string | null) => {
    const res = await apiClient.patch(`/hrd/pegawai/${idPegawai}/peran`, { idPeran });
    return res.data;
  },
};
