import { apiClient } from "./api-client";
import { PengajuanJadwalItem } from "@/shared/types/api";

export const pengajuanJadwalService = {
  ajukan: async (data: {
    idJadwal: string;
    jenisPengajuan?: string;
    tanggalBaru?: string;
    shiftBaru?: string;
    jamMulaiBaru?: string;
    jamSelesaiBaru?: string;
    alasan: string;
  }) => {
    const res = await apiClient.post<PengajuanJadwalItem>("/pengajuan-jadwal", data);
    return res.data;
  },

  pengajuanSaya: async () => {
    const res = await apiClient.get<PengajuanJadwalItem[]>("/pengajuan-jadwal/saya");
    return res.data;
  },

  batalkan: async (idPengajuan: string) => {
    const res = await apiClient.patch(`/pengajuan-jadwal/${idPengajuan}/batal`);
    return res.data;
  },

  daftarPengajuan: async (params?: { status?: string }) => {
    const res = await apiClient.get<PengajuanJadwalItem[]>("/pengajuan-jadwal", { params });
    return res.data;
  },

  setujui: async (idPengajuan: string) => {
    const res = await apiClient.patch<PengajuanJadwalItem>(`/pengajuan-jadwal/${idPengajuan}/setujui`);
    return res.data;
  },

  tolak: async (idPengajuan: string, alasanPenolakan: string) => {
    const res = await apiClient.patch<PengajuanJadwalItem>(`/pengajuan-jadwal/${idPengajuan}/tolak`, {
      alasanPenolakan,
    });
    return res.data;
  },
};
