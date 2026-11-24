import { asyncHandler } from '../utils/http.js';
import { ROLES } from '../utils/roles.js';
import {
  getHrdDashboardData,
  getKeuanganDashboardData,
  getSekretarisDashboardData,
  getTenagaMedisDashboardData,
} from '../services/dashboard.service.js';

export const getHrdDashboard = asyncHandler(async (req, res) => {
  const data = await getHrdDashboardData();
  res.json({
    success: true,
    data,
  });
});

export const getKeuanganDashboard = asyncHandler(async (req, res) => {
  const data = await getKeuanganDashboardData();
  res.json({
    success: true,
    data,
  });
});

export const getSekretarisDashboard = asyncHandler(async (req, res) => {
  const data = await getSekretarisDashboardData(
    req.user?.idPegawai,
    req.user?.pegawai?.unitKerja,
  );
  res.json({
    success: true,
    data,
  });
});

export const getTenagaMedisDashboard = asyncHandler(async (req, res) => {
  const data = await getTenagaMedisDashboardData(req.user?.idPegawai);
  res.json({
    success: true,
    data,
  });
});

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const role = req.user?.role;
  let data;

  switch (role) {
    case ROLES.HRD:
      data = await getHrdDashboardData();
      break;
    case ROLES.MANAJEMEN_KEUANGAN:
      data = await getKeuanganDashboardData();
      break;
    case ROLES.SEKRETARIS_UNIT:
      data = await getSekretarisDashboardData(
        req.user?.idPegawai,
        req.user?.pegawai?.unitKerja,
      );
      break;
    case ROLES.TENAGA_MEDIS:
    default:
      data = await getTenagaMedisDashboardData(req.user?.idPegawai);
      break;
  }

  res.json({
    success: true,
    role,
    data,
  });
});
