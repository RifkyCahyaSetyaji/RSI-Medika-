import { apiClient } from "./api-client";
import {
  HrdDashboardData,
  KeuanganDashboardData,
  SekretarisDashboardData,
  TenagaMedisDashboardData,
} from "@/shared/types/api";

export const dashboardService = {
  getHrdDashboard: async (): Promise<HrdDashboardData> => {
    const res = await apiClient.get<HrdDashboardData>("/dashboard/hrd");
    return res.data;
  },

  getKeuanganDashboard: async (): Promise<KeuanganDashboardData> => {
    const res = await apiClient.get<KeuanganDashboardData>("/dashboard/keuangan");
    return res.data;
  },

  getSekretarisDashboard: async (): Promise<SekretarisDashboardData> => {
    const res = await apiClient.get<SekretarisDashboardData>("/dashboard/sekretaris");
    return res.data;
  },

  getTenagaMedisDashboard: async (): Promise<TenagaMedisDashboardData> => {
    const res = await apiClient.get<TenagaMedisDashboardData>("/dashboard/tenaga-medis");
    return res.data;
  },

  getSummary: async (): Promise<any> => {
    const res = await apiClient.get<any>("/dashboard/summary");
    return res.data;
  },
};
