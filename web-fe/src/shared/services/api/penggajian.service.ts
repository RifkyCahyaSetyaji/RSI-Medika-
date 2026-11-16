import { apiClient } from "./api-client";
import { PenggajianItem, RekeningItem, TransaksiItem } from "@/shared/types/api";

export const penggajianService = {
  rekeningSaya: async () => {
    const res = await apiClient.get<RekeningItem[]>("/penggajian/rekening/saya");
    return res.data;
  },

  tambahRekening: async (data: { namaBank: string; nomorRekening: string; atasNama: string }) => {
    const res = await apiClient.post<RekeningItem>("/penggajian/rekening", data);
    return res.data;
  },

  hapusRekening: async (idRekening: string) => {
    const res = await apiClient.delete(`/penggajian/rekening/${idRekening}`);
    return res;
  },

  riwayatTransaksi: async () => {
    const res = await apiClient.get<TransaksiItem[]>("/penggajian/transaksi/riwayat");
    return res.data;
  },

  gajiSaya: async (params?: { periode?: string }) => {
    const res = await apiClient.get<PenggajianItem[]>("/penggajian/saya", { params });
    return res.data;
  },

  daftarGaji: async (params?: { periode?: string; status?: string; idPegawai?: string }) => {
    const res = await apiClient.get<PenggajianItem[]>("/penggajian", { params });
    return res.data;
  },

  detailGaji: async (idGaji: string) => {
    const res = await apiClient.get<PenggajianItem>(`/penggajian/${idGaji}`);
    return res.data;
  },

  hitungGajiPegawai: async (data: {
    idPegawai: string;
    periode: string;
    jumlahShiftMalam?: number;
    jamLembur?: number;
    hariHadir?: number;
    nilaiJasaMedis?: number;
    hariAlpa?: number;
    jumlahTerlambat?: number;
  }) => {
    const res = await apiClient.post<PenggajianItem>("/penggajian/hitung", data);
    return res.data;
  },

  hitungGajiBulk: async (data: { periode: string }) => {
    const res = await apiClient.post<{ diproses: number }>("/penggajian/hitung-bulk", data);
    return res.data;
  },

  bayarGaji: async (idGaji: string, data?: { idRekening?: string; catatan?: string }) => {
    const res = await apiClient.post<TransaksiItem>(`/penggajian/${idGaji}/bayar`, data);
    return res.data;
  },

  bayarGajiBulk: async (data: { idGajiList: string[] }) => {
    const res = await apiClient.post<{ diproses: number }>("/penggajian/bayar-bulk", data);
    return res.data;
  },
};
