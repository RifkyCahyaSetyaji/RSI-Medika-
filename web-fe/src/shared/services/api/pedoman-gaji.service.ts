import { apiClient } from "./api-client";
import { PedomanGajiItem } from "@/shared/types/api";

export const pedomanGajiService = {
  daftarPedoman: async (params?: { idPeran?: string; aktif?: boolean }) => {
    const res = await apiClient.get<PedomanGajiItem[]>("/pedoman-gaji", { params });
    return res.data;
  },

  detailPedoman: async (idPedoman: string) => {
    const res = await apiClient.get<PedomanGajiItem>(`/pedoman-gaji/${idPedoman}`);
    return res.data;
  },

  buatPedoman: async (data: Omit<PedomanGajiItem, "idPedoman" | "peran_tenaga_medis">) => {
    const res = await apiClient.post<PedomanGajiItem>("/pedoman-gaji", data);
    return res.data;
  },

  ubahPedoman: async (idPedoman: string, data: Partial<PedomanGajiItem>) => {
    const res = await apiClient.patch<PedomanGajiItem>(`/pedoman-gaji/${idPedoman}`, data);
    return res.data;
  },

  hapusPedoman: async (idPedoman: string) => {
    const res = await apiClient.delete(`/pedoman-gaji/${idPedoman}`);
    return res;
  },
};
