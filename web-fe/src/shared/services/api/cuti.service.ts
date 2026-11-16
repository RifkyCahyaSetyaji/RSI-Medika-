import { apiClient } from "./api-client";
import { CutiItem } from "@/shared/types/api";

export const cutiService = {
  jenisCuti: async () => {
    const res = await apiClient.get<string[]>("/cuti/jenis");
    return res.data;
  },

  notifikasiSaya: async () => {
    const res = await apiClient.get<any[]>("/cuti/notifikasi");
    return res.data;
  },

  ajukanCuti: async (data: {
    tanggalMulai: string;
    tanggalSelesai: string;
    jenisCuti: string;
    alasan: string;
  }) => {
    const res = await apiClient.post<CutiItem>("/cuti", data);
    return res.data;
  },

  cutiSaya: async () => {
    const res = await apiClient.get<CutiItem[]>("/cuti/saya");
    return res.data;
  },

  batalkanCuti: async (idPengajuan: string) => {
    const res = await apiClient.patch(`/cuti/${idPengajuan}/batal`);
    return res.data;
  },

  daftarCuti: async (params?: { status?: string }) => {
    const res = await apiClient.get<CutiItem[]>("/cuti", { params });
    return res.data;
  },

  detailCuti: async (idPengajuan: string) => {
    const res = await apiClient.get<CutiItem>(`/cuti/${idPengajuan}`);
    return res.data;
  },

  setujuiCuti: async (idPengajuan: string, catatan?: string) => {
    const res = await apiClient.patch<CutiItem>(`/cuti/${idPengajuan}/setujui`, { catatan });
    return res.data;
  },

  tolakCuti: async (idPengajuan: string, catatan: string) => {
    const res = await apiClient.patch<CutiItem>(`/cuti/${idPengajuan}/tolak`, { catatan });
    return res.data;
  },
};
