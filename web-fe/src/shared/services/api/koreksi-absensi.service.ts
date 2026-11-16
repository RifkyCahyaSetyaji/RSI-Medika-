import { apiClient } from "./api-client";
import { KoreksiAbsensiItem } from "@/shared/types/api";

export const koreksiAbsensiService = {
  ajukanKoreksi: async (data: {
    idAbsensi: string;
    waktuMasukBaru?: string;
    waktuPulangBaru?: string;
    alasanKoreksi: string;
    berkasPendukung?: string;
  }) => {
    const res = await apiClient.post<KoreksiAbsensiItem>("/koreksi-absensi", data);
    return res.data;
  },

  koreksiSaya: async () => {
    const res = await apiClient.get<KoreksiAbsensiItem[]>("/koreksi-absensi/saya");
    return res.data;
  },

  batalkanKoreksi: async (idKoreksi: string) => {
    const res = await apiClient.patch(`/koreksi-absensi/${idKoreksi}/batal`);
    return res.data;
  },

  daftarKoreksi: async (params?: { status?: string }) => {
    const res = await apiClient.get<KoreksiAbsensiItem[]>("/koreksi-absensi", { params });
    return res.data;
  },

  setujuiKoreksi: async (idKoreksi: string, catatan?: string) => {
    const res = await apiClient.patch<KoreksiAbsensiItem>(`/koreksi-absensi/${idKoreksi}/setujui`, { catatan });
    return res.data;
  },

  tolakKoreksi: async (idKoreksi: string, catatan: string) => {
    const res = await apiClient.patch<KoreksiAbsensiItem>(`/koreksi-absensi/${idKoreksi}/tolak`, { catatan });
    return res.data;
  },
};
