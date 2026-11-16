import { apiClient } from "./api-client";
import { BandingGajiItem } from "@/shared/types/api";

export const bandingGajiService = {
  ajukanBanding: async (data: {
    periodeGaji: string;
    alasanBanding: string;
    buktiPendukung?: string;
  }) => {
    const res = await apiClient.post<BandingGajiItem>("/banding-gaji", data);
    return res.data;
  },

  bandingSaya: async (params?: { periode?: string; status?: string }) => {
    const res = await apiClient.get<BandingGajiItem[]>("/banding-gaji/saya", { params });
    return res.data;
  },

  batalkanBanding: async (idPengajuan: string) => {
    const res = await apiClient.patch(`/banding-gaji/${idPengajuan}/batal`);
    return res.data;
  },

  daftarBanding: async (params?: { periode?: string; status?: string }) => {
    const res = await apiClient.get<BandingGajiItem[]>("/banding-gaji", { params });
    return res.data;
  },

  detailBanding: async (idPengajuan: string) => {
    const res = await apiClient.get<BandingGajiItem>(`/banding-gaji/${idPengajuan}`);
    return res.data;
  },

  prosesBanding: async (
    idPengajuan: string,
    data: {
      status: "Disetujui" | "Ditolak" | "Diproses";
      keputusan?: string;
      selisihTunjangan?: number;
      selisihPotongan?: number;
      tunjanganBaru?: number;
      potonganBaru?: number;
    }
  ) => {
    const res = await apiClient.patch<BandingGajiItem>(`/banding-gaji/${idPengajuan}/proses`, data);
    return res.data;
  },
};
