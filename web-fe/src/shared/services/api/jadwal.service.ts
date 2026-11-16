
import { apiClient } from "./api-client";
import { JadwalItem, ShiftItem } from "@/shared/types/api";

export const jadwalService = {
  daftarShift: async () => {
    const res = await apiClient.get<ShiftItem[]>("/jadwal/shift");
    return res.data;
  },

  jadwalSaya: async (params?: {
    tanggalMulai?: string;
    tanggalSelesai?: string;
    bulan?: number | string;
    tahun?: number | string;
  }) => {
    const res = await apiClient.get<JadwalItem[]>("/jadwal/saya", { params });
    return res.data;
  },

  daftarJadwal: async (params?: {
    tanggalMulai?: string;
    tanggalSelesai?: string;
    idPegawai?: string;
    unitKerja?: string;
  }) => {
    const res = await apiClient.get<JadwalItem[]>("/jadwal", { params });
    return res.data;
  },

  buatJadwal: async (data: {
    idPegawai: string;
    tanggal: string;
    jamMulai: string;
    jamSelesai: string;
    jenisJadwal: string;
  }) => {
    const res = await apiClient.post<JadwalItem>("/jadwal", data);
    return res.data;
  },

  buatJadwalBulk: async (jadwalList: any[]) => {
    const res = await apiClient.post<{ count: number }>("/jadwal/bulk", { jadwalList });
    return res.data;
  },

  ubahJadwal: async (idJadwal: string, data: Partial<JadwalItem>) => {
    const res = await apiClient.patch<JadwalItem>(`/jadwal/${idJadwal}`, data);
    return res.data;
  },

  hapusJadwal: async (idJadwal: string) => {
    const res = await apiClient.delete(`/jadwal/${idJadwal}`);
    return res;
  },
};
