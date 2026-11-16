import { apiClient } from "./api-client";
import { IzinItem } from "@/shared/types/api";

export const izinService = {
  jenisIzin: async () => {
    const res = await apiClient.get<string[]>("/izin/jenis");
    return res.data;
  },

  ajukanIzin: async (data: {
    tanggalMulai: string;
    tanggalSelesai: string;
    jenis: string;
    alasan: string;
    berkasPendukung?: string;
  }) => {
    const res = await apiClient.post<IzinItem>("/izin", data);
    return res.data;
  },

  izinSaya: async () => {
    const res = await apiClient.get<IzinItem[]>("/izin/saya");
    return res.data;
  },

  batalkanIzin: async (idPengajuan: string) => {
    const res = await apiClient.patch(`/izin/${idPengajuan}/batal`);
    return res.data;
  },

  daftarIzin: async (params?: { status?: string }) => {
    const res = await apiClient.get<IzinItem[]>("/izin", { params });
    return res.data;
  },

  setujuiIzin: async (idPengajuan: string, catatan?: string) => {
    const res = await apiClient.patch<IzinItem>(`/izin/${idPengajuan}/setujui`, { catatan });
    return res.data;
  },

  tolakIzin: async (idPengajuan: string, catatan: string) => {
    const res = await apiClient.patch<IzinItem>(`/izin/${idPengajuan}/tolak`, { catatan });
    return res.data;
  },
};
