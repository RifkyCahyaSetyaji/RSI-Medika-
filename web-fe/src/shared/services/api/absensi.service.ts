import { apiClient } from "./api-client";
import { AbsensiItem, AbsensiStatusResponse } from "@/shared/types/api";

export const absensiService = {
  getStatus: async () => {
    const res = await apiClient.get<AbsensiStatusResponse>("/absensi/status");
    return res.data;
  },

  absenMasuk: async (data?: { catatan?: string; idJadwal?: string }) => {
    const res = await apiClient.post<AbsensiItem>("/absensi/masuk", data);
    return res.data;
  },

  absenPulang: async (data?: { catatan?: string; idAbsensi?: string }) => {
    const res = await apiClient.post<AbsensiItem>("/absensi/pulang", data);
    return res.data;
  },

  riwayatSaya: async (params?: {
    periode?: string;
    bulan?: number | string;
    tahun?: number | string;
    dari?: string;
    sampai?: string;
    limit?: number;
  }) => {
    const res = await apiClient.get<AbsensiItem[]>("/absensi/riwayat", { params });
    return res.data;
  },

  detailRiwayat: async (idJadwal: string) => {
    const res = await apiClient.get<AbsensiItem>(`/absensi/riwayat/${idJadwal}`);
    return res.data;
  },

  rekapAbsensi: async (params?: {
    periode?: string;
    bulan?: number | string;
    tahun?: number | string;
    tanggalMulai?: string;
    tanggalSelesai?: string;
    dari?: string;
    sampai?: string;
    idPegawai?: string;
    unitKerja?: string;
  }) => {
    const queryParams: Record<string, string | number | undefined> = {
      ...params,
      dari: params?.dari || params?.tanggalMulai,
      sampai: params?.sampai || params?.tanggalSelesai,
    };
    const res = await apiClient.get<AbsensiItem[]>("/absensi/rekap", { params: queryParams });
    return res.data;
  },
};
